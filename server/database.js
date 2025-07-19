import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = sqlite3.verbose();

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'rss_reader.db');
    this.db = null;
  }

  // Promisified helper methods
  _run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  _get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  _all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async connect() {
    try {
      // Force close any existing connection first
      if (this.db) {
        await this.close();
      }
      
      // Ensure the server directory exists
      const serverDir = path.dirname(this.dbPath);
      if (!fs.existsSync(serverDir)) {
        fs.mkdirSync(serverDir, { recursive: true });
      }
      
      // Clean up lock files more safely
      await this.cleanupLockFiles();
      
      await this.retryConnect();
      await this._initializeTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async retryConnect(maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.openDatabase();
        console.log(`Database connection successful on attempt ${attempt}`);
        return;
      } catch (error) {
        if (error.code === 'SQLITE_BUSY' && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500; // Exponential backoff: 1s, 2s, 4s, 8s
          console.log(`Database busy, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Clean up lock files before retry
          await this.cleanupLockFiles();
          continue;
        }
        throw error;
      }
    }
  }

  async openDatabase() {
    if (this.db) {
      await this.close(); // Close existing connection
    }
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite.Database(this.dbPath, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          this.db = null;
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.configureDatabase();
          resolve();
        }
      });
    });
  }

  configureDatabase() {
    // Add error handler for runtime database errors
    if (this.db) {
      this.db.on('error', (err) => {
        console.error('Database runtime error:', err);
        // Don't crash on database errors
      });
    }
    try {
      // Use very conservative settings to completely avoid lock issues
      this.db.configure('busyTimeout', 30000); // 30 second timeout
      
      // Use DELETE mode to avoid WAL file issues in WebContainer
      this.db.run('PRAGMA journal_mode = DELETE');
      this.db.run('PRAGMA locking_mode = EXCLUSIVE');
      this.db.run('PRAGMA synchronous = OFF');
      this.db.run('PRAGMA cache_size = -2000');
      this.db.run('PRAGMA temp_store = MEMORY');
      this.db.run('PRAGMA foreign_keys = OFF');
      
      console.log('Database configured successfully');
    } catch (error) {
      console.error('Database configuration error:', error);
    }
  }

  async cleanupLockFiles() {
    // Only remove lock files, not the main database
    const lockFilesToRemove = [
      this.dbPath + '-journal',
      this.dbPath + '-wal',
      this.dbPath + '-shm'
    ];
    
    for (const file of lockFilesToRemove) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`Removed lock file: ${file}`);
        }
      } catch (error) {
        // Ignore cleanup errors for lock files
        console.log(`Could not remove lock file ${file}:`, error.message);
      }
    }
  }

  async _initializeTables(insertDefaults = true) {
    // Wait longer for database to be ready and ensure exclusive access
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set immediate mode to avoid lock conflicts
    try {
      await this._run('PRAGMA locking_mode = EXCLUSIVE');
      await this._run('PRAGMA journal_mode = MEMORY');
      await this._run('PRAGMA synchronous = OFF');
      await this._run('PRAGMA busy_timeout = 30000');
      console.log('Database pragmas set successfully');
    } catch (error) {
      console.error('Error setting database pragmas:', error);
    }
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS categories (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS feeds (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        logo_url TEXT,
        categories_uid INTEGER,
        last DATETIME,
        active INTEGER NOT NULL DEFAULT 1
      )`,
      
      `CREATE TABLE IF NOT EXISTS stories (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        source_uid INTEGER NOT NULL,
        categories_uid INTEGER,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        published INTEGER NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1,
        last DATETIME
      )`,
      
      `CREATE TABLE IF NOT EXISTS api (
        key_name TEXT PRIMARY KEY,
        key_value TEXT
      )`,
      
      `CREATE TABLE IF NOT EXISTS reactions (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL
      )`
    ];

    // Create tables one by one with delays
    for (let i = 0; i < tables.length; i++) {
      const sql = tables[i];
      try {
        console.log(`Creating table ${i + 1}/${tables.length}...`);
        await this.retryOperation(() => this._run(sql), 3);
        await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay between operations
      } catch (err) {
        console.error(`Error creating table ${i + 1}:`, err);
        throw err;
      }
    }

    // Create view after all tables exist
    try {
      await this.retryOperation(() => this._run(`CREATE VIEW IF NOT EXISTS storiesView AS
        SELECT
          stories.uid AS UID,
          feeds.name AS feed_name,
          feeds.logo_url AS feed_logo_url,
          feeds.url AS source_url,
          stories.categories_uid AS categories_uid,
          categories.title AS category_name,
          stories.title AS title,
          stories.link AS link,
          stories.visible AS visible,
          stories.published AS published,
          stories.last AS last
        FROM stories
        LEFT JOIN feeds ON stories.source_uid = feeds.uid
        LEFT JOIN categories ON stories.categories_uid = categories.uid`), 3);
    } catch (err) {
      console.error('Error creating view:', err);
      // Don't throw, view creation can fail if tables don't exist yet
    }

    // Insert default data with delays
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Insert default category if none exists
      const categoryCount = await this.retryOperation(() => this._get('SELECT COUNT(*) as count FROM categories'), 3);
      if (categoryCount.count === 0) {
        await this.retryOperation(() => this._run('INSERT INTO categories (title) VALUES (?)', ['General']), 3);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Insert default API keys if none exist
      const apiKeyCount = await this.retryOperation(() => this._get('SELECT COUNT(*) as count FROM api'), 3);
      if (apiKeyCount.count === 0) {
        const defaultKeys = [
          'XAI_API_KEY',
          'BEARER',
          'CONSUMER_KEY',
          'CONSUMER_SECRET',
          'ACCESS_TOKEN',
          'ACCESS_SECRET'
        ];
        
        for (const keyName of defaultKeys) {
          await this.retryOperation(() => this._run('INSERT INTO api (key_name, key_value) VALUES (?, ?)', [keyName, '']), 3);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Insert default reactions if none exist
      const reactionCount = await this.retryOperation(() => this._get('SELECT COUNT(*) as count FROM reactions'), 3);
      if (reactionCount.count === 0) {
        // Clear existing reactions and insert new ones
        await this.retryOperation(() => this._run('DELETE FROM reactions'), 3);
        
        // Insert new default reactions
        const defaultReactions = [
          { type: '00. neutral', prompt: 'Generate a 2-sentence commentary on this story: [{story}]. Ensure it is natural and human-like, neutral overall, but add a touch of subtle humor or pun, with emojis optional.' },
          { type: '01. sarcastic', prompt: 'Generate a 2-sentence reaction to this story: [{story}]. Ensure it comes across as written by a human, sarcastic in tone, but slip in some subtle humor or a pun, with optional emojis.' },
          { type: '02. amused', prompt: 'Write a quick 2-sentence response to the story: [{story}]. Keep it human-sounding, amused in tone, ensuring there is subtle humor or a pun baked in, and throw in emojis as needed.' },
          { type: '03. excited', prompt: 'Write a 2-sentence reaction to this story: [{story}]. Make it sound like a real person wrote it, super excited overall, but weave in a subtle pun or humor, and feel free to add emojis.' },
          { type: '04. surprised', prompt: 'Produce a 2-sentence reaction to this tale: [{story}]. It needs to sound like everyday human writing, with a surprised vibe, plus a subtle humorous element or pun, and emojis if they enhance it.' },
          { type: '05. disappointed', prompt: 'Craft a 2-sentence response to the following story: [{story}]. It should read naturally like human commentary, with an overall disappointed tone, including a subtle humorous twist or pun, and emojis if they fit.' },
          { type: '06. thoughtful', prompt: 'Create a 2-sentence take on the story below: [{story}]. Make it feel authentic and human-like, thoughtful overall, incorporating a light pun or subtle joke, and emojis where appropriate.' },
          { type: '07. skeptical', prompt: 'Come up with a 2-sentence reaction to this story: [{story}]. Make it read like a person casual thoughts, skeptical overall, but include a subtle pun or witty humor, with possible emojis.' },
          { type: '08. empathetic', prompt: 'Draft a 2-sentence reaction to the following story: [{story}]. It should feel genuinely human-written, empathetic in tone, weaving in subtle humor or a pun, and emojis if suitable.' },
          { type: '09. outraged', prompt: 'Create a 2-sentence response to the story here: [{story}]. Make it sound like a real human venting, outraged in tone, including some subtle punny humor, and emojis to emphasize.' }
        ];
        
        for (const reaction of defaultReactions) {
          await this.retryOperation(() => this._run('INSERT INTO reactions (type, prompt) VALUES (?, ?)', [reaction.type, reaction.prompt]), 3);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log('Inserted default reactions');
      }
    } catch (err) {
      console.error('Error inserting default data:', err);
      // Don't throw, let the app continue
    }

    console.log('Database initialization completed');

    // Only insert default data if requested (skip during imports)
    if (!insertDefaults) {
      console.log('Skipping default data insertion');
      return;
    }

  }

  // Retry operation with exponential backoff for database lock issues
  async retryOperation(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error.code === 'SQLITE_BUSY' && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100; // Exponential backoff: 200ms, 400ms, 800ms
          console.log(`Database busy, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  // Drop all tables to reset AUTOINCREMENT sequences
  async dropTables() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tablesToDrop = [
      'DROP VIEW IF EXISTS storiesView',
      'DROP TABLE IF EXISTS stories',
      'DROP TABLE IF EXISTS feeds', 
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS api',
      'DROP TABLE IF EXISTS reactions'
    ];

    for (const sql of tablesToDrop) {
      try {
        await this.retryOperation(() => this._run(sql), 3);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error dropping table with SQL: ${sql}`, err);
        throw err;
      }
    }

    // Reset AUTOINCREMENT sequences by clearing sqlite_sequence table
    try {
      await this.retryOperation(() => this._run('DELETE FROM sqlite_sequence WHERE name IN (?, ?, ?, ?)', 
        ['categories', 'feeds', 'stories', 'reactions']), 3);
      console.log('AUTOINCREMENT sequences reset successfully');
    } catch (err) {
      console.error('Error resetting AUTOINCREMENT sequences:', err);
      // Don't throw, as this might not be critical
    }

    console.log('All tables dropped successfully');
  }

  // Clear and reset reactions with new defaults
  resetReactions() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.run('DELETE FROM reactions', (deleteErr) => {
        if (deleteErr) {
          reject(deleteErr);
          return;
        }
        
        const defaultReactions = [
          { type: '00. neutral', prompt: 'Generate a 2-sentence commentary on this story: [{story}]. Ensure it\'s natural and human-like, neutral overall, but add a touch of subtle humor or pun, with emojis optional.' },
          { type: '01. sarcastic', prompt: 'Generate a 2-sentence reaction to this story: [{story}]. Ensure it comes across as written by a human, sarcastic in tone, but slip in some subtle humor or a pun, with optional emojis.' },
          { type: '02. amused', prompt: 'Write a quick 2-sentence response to the story: [{story}]. Keep it human-sounding, amused in tone, ensuring there\'s subtle humor or a pun baked in, and throw in emojis as needed.' },
          { type: '03. excited', prompt: 'Write a 2-sentence reaction to this story: [{story}]. Make it sound like a real person wrote it, super excited overall, but weave in a subtle pun or humor, and feel free to add emojis.' },
          { type: '04. surprised', prompt: 'Produce a 2-sentence reaction to this tale: [{story}]. It needs to sound like everyday human writing, with a surprised vibe, plus a subtle humorous element or pun, and emojis if they enhance it.' },
          { type: '05. disappointed', prompt: 'Craft a 2-sentence response to the following story: [{story}]. It should read naturally like human commentary, with an overall disappointed tone, including a subtle humorous twist or pun, and emojis if they fit.' },
          { type: '06. thoughtful', prompt: 'Create a 2-sentence take on the story below: [{story}]. Make it feel authentic and human-like, thoughtful overall, incorporating a light pun or subtle joke, and emojis where appropriate.' },
          { type: '07. skeptical', prompt: 'Come up with a 2-sentence reaction to this story: [{story}]. Make it read like a person\'s casual thoughts, skeptical overall, but include a subtle pun or witty humor, with possible emojis.' },
          { type: '08. empathetic', prompt: 'Draft a 2-sentence reaction to the following story: [{story}]. It should feel genuinely human-written, empathetic in tone, weaving in subtle humor or a pun, and emojis if suitable.' },
          { type: '09. outraged', prompt: 'Create a 2-sentence response to the story here: [{story}]. Make it sound like a real human venting, outraged in tone, including some subtle punny humor, and emojis to emphasize.' }
        ];
        
        let completed = 0;
        defaultReactions.forEach(reaction => {
          this.db.run('INSERT INTO reactions (type, prompt) VALUES (?, ?)', [reaction.type, reaction.prompt], (insertErr) => {
            if (insertErr) {
              reject(insertErr);
              return;
            }
            completed++;
            if (completed === defaultReactions.length) {
              resolve(completed);
            }
          });
        });
      });
    });
  }

  // Feed operations
  getAllFeeds() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.log('Database not initialized, attempting to reconnect...');
        this.openDatabase().then(() => {
          if (this.db) {
            this.getAllFeeds().then(resolve).catch(reject);
          } else {
            reject(new Error('Database connection failed'));
          }
        }).catch(reject);
        return;
      }
      
      this.db.serialize(() => {
        this.db.all('SELECT feeds.*, categories.title as category_name FROM feeds LEFT JOIN categories ON feeds.categories_uid = categories.uid ORDER BY feeds.name', (err, rows) => {
          if (err) {
            console.error('getAllFeeds error:', err);
            reject(err);
          }
          else resolve(rows);
        });
      });
    });
  }

  // New method to handle full database reconnection
  async reconnect() {
    console.log('Starting database reconnection...');
    
    try {
      // Close existing connection
      await this.close();
      
      // Clean up database files
      await this.cleanupLockFiles();
      
      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-initialize database
      await this.connect();
      
      console.log('Database reconnection completed successfully');
      return true;
    } catch (error) {
      console.error('Database reconnection failed:', error);
      throw error;
    }
  }

  addFeed(name, url, categories_uid, logo_url = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('INSERT INTO feeds (name, url, categories_uid, logo_url) VALUES (?, ?, ?, ?)', 
        [name, url, categories_uid, logo_url], function(err) {
          if (err) {
            console.error('addFeed error:', err);
            reject(err);
          }
          else resolve(this.lastID);
        });
      });
    });
  }

  updateFeed(uid, name, url, active, categories_uid, logo_url = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        // Update the feed
        this.db.run('UPDATE feeds SET name = ?, url = ?, active = ?, categories_uid = ?, logo_url = ? WHERE uid = ?', 
          [name, url, active, categories_uid, logo_url, uid], (err) => {
          if (err) {
            console.error('updateFeed error:', err);
            reject(err);
            return;
          }
          
          // Update all stories from this feed to use the new category
          this.db.run('UPDATE stories SET categories_uid = ? WHERE source_uid = ?', 
            [categories_uid, uid], function(err) {
            if (err) {
              console.error('updateFeed stories error:', err);
              reject(err);
            }
            else resolve(this.changes);
          });
        });
      });
    });
  }

  deleteFeed(uid) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.run('DELETE FROM feeds WHERE uid = ?', [uid], function(err) {
        if (err) {
          console.error('deleteFeed error:', err);
          reject(err);
        }
        else resolve(this.changes);
      });
    });
  }

  // Category operations
  getAllCategories() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.all('SELECT * FROM categories ORDER BY title', (err, rows) => {
          if (err) {
            console.error('getAllCategories error:', err);
            reject(err);
          }
          else resolve(rows);
        });
      });
    });
  }

  addCategory(title) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('INSERT INTO categories (title) VALUES (?)', [title], function(err) {
          if (err) {
            console.error('addCategory error:', err);
            reject(err);
          }
          else resolve(this.lastID);
        });
      });
    });
  }

  updateCategory(uid, title) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('UPDATE categories SET title = ? WHERE uid = ?', [title, uid], function(err) {
          if (err) {
            console.error('updateCategory error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  deleteCategory(uid) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('DELETE FROM categories WHERE uid = ?', [uid], function(err) {
          if (err) {
            console.error('deleteCategory error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  // Story operations
  getAllStories() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.all('SELECT * FROM storiesView ORDER BY datetime(last) DESC', (err, rows) => {
          if (err) {
            console.error('getAllStories error:', err);
            reject(err);
          }
          else resolve(rows);
        });
      });
    });
  }

  addStory(source_uid, categories_uid, title, link, pubDate = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      // Use the provided pubDate or fall back to current time
      const storyDate = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
      
      this.db.serialize(() => {
        this.db.run('INSERT INTO stories (source_uid, categories_uid, title, link, last) VALUES (?, ?, ?, ?, ?)', 
        [source_uid, categories_uid, title, link, storyDate], function(err) {
          if (err) {
            console.error('addStory error:', err);
            reject(err);
          }
          else resolve(this.lastID);
        });
      });
    });
  }

  updateStoryVisibility(uid, visible) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('UPDATE stories SET visible = ? WHERE uid = ?', [visible, uid], function(err) {
          if (err) {
            console.error('updateStoryVisibility error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  updateStoryPublished(uid, published) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('UPDATE stories SET published = ? WHERE uid = ?', [published, uid], function(err) {
          if (err) {
            console.error('updateStoryPublished error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  checkStoryExists(link) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.get('SELECT uid FROM stories WHERE link = ?', [link], (err, row) => {
          if (err) {
            console.error('checkStoryExists error:', err);
            reject(err);
          }
          else resolve(!!row);
        });
      });
    });
  }

  purgeAllStories() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('DELETE FROM stories', function(err) {
          if (err) {
            console.error('purgeAllStories error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  purgeCategoryStories(categories_uid) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('DELETE FROM stories WHERE categories_uid = ?', [categories_uid], function(err) {
          if (err) {
            console.error('purgeCategoryStories error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  purgeOldStories(days) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffISO = cutoffDate.toISOString();
      
      this.db.serialize(() => {
        this.db.run('DELETE FROM stories WHERE datetime(last) < datetime(?)', [cutoffISO], function(err) {
          if (err) {
            console.error('purgeOldStories error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  purgeSourceStories(source_uid) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('DELETE FROM stories WHERE source_uid = ?', [source_uid], function(err) {
          if (err) {
            console.error('purgeSourceStories error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  // API Key operations
  getAllApiKeys() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.all('SELECT * FROM api ORDER BY key_name', (err, rows) => {
          if (err) {
            console.error('getAllApiKeys error:', err);
            reject(err);
          }
          else resolve(rows);
        });
      });
    });
  }

  updateApiKey(keyName, keyValue) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('UPDATE api SET key_value = ? WHERE key_name = ?', [keyValue, keyName], function(err) {
          if (err) {
            console.error('updateApiKey error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  // Reaction operations
  getAllReactions() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.all('SELECT * FROM reactions ORDER BY type', (err, rows) => {
          if (err) {
            console.error('getAllReactions error:', err);
            reject(err);
          }
          else resolve(rows);
        });
      });
    });
  }

  addReaction(type, prompt) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('INSERT INTO reactions (type, prompt) VALUES (?, ?)', [type, prompt], function(err) {
          if (err) {
            console.error('addReaction error:', err);
            reject(err);
          }
          else resolve(this.lastID);
        });
      });
    });
  }

  updateReaction(uid, type, prompt) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('UPDATE reactions SET type = ?, prompt = ? WHERE uid = ?', [type, prompt, uid], function(err) {
          if (err) {
            console.error('updateReaction error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  deleteReaction(uid) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      this.db.serialize(() => {
        this.db.run('DELETE FROM reactions WHERE uid = ?', [uid], function(err) {
          if (err) {
            console.error('deleteReaction error:', err);
            reject(err);
          }
          else resolve(this.changes);
        });
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database connection closed');
          }
          this.db = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export default Database;