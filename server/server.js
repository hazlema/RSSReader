import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from './database.js';
import RSSParser from './rssParser.js';
import WebSocketServer from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Never exit on any database or file system errors
  if (error.code === 'EIO' || 
      error.code === 'ENOENT' || 
      error.message?.includes('lock') || 
      error.message?.includes('database') ||
      error.message?.includes('SQLITE') ||
      error.message?.includes('lstat') ||
      error.message?.includes('dirent')) {
    console.log('Database/filesystem error ignored to prevent crash');
    return; // Don't crash
  }
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Never exit on any database or file system errors
  if (reason && (
      reason.code === 'EIO' || 
      reason.code === 'ENOENT' || 
      reason.message?.includes('lock') ||
      reason.message?.includes('database') ||
      reason.message?.includes('SQLITE') ||
      reason.message?.includes('lstat') ||
      reason.message?.includes('dirent'))) {
    console.log('Database/filesystem rejection ignored to prevent crash');
    return; // Don't crash
  }
  process.exit(1);
});

const app = express();
const server = http.createServer(app);

// Initialize database and services - wait for database to be ready
const database = new Database();
let wsServer;

// Initialize database connection before starting services
(async () => {
  try {
    await database.connect();
    console.log('Database initialized successfully');
    
    const rssParser = new RSSParser();
    wsServer = new WebSocketServer(server, database, rssParser);
    
    console.log('All services initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Thumbnail fetching endpoint
app.get('/api/thumbnail', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  // Validate URL format and protocol
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  try {
    //console.log(`Fetching thumbnail for: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      signal: AbortSignal.timeout(120000)
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch page: ${response.status} ${response.statusText}`);
      return res.status(404).json({ error: 'Failed to fetch page' });
    }
    
    // Check if the response is HTML content
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.log(`Non-HTML content type: ${contentType}`);
      return res.json({ thumbnail: null });
    }
    
    const html = await response.text();
    //console.log(`Fetched HTML length: ${html.length} characters`);
    
    // Parse HTML to find thumbnail
    const thumbnailRegexes = [
      // Open Graph images (most common)
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i,
      /<meta\s+property=["']og:image:url["']\s+content=["']([^"']+)["']/i,
      // Twitter cards
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+name=["']twitter:image:src["']\s+content=["']([^"']+)["']/i,
      // Other meta tags
      /<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i,
      /<meta\s+name=["']thumbnail["']\s+content=["']([^"']+)["']/i,
      /<meta\s+itemprop=["']image["']\s+content=["']([^"']+)["']/i,
      // JSON-LD structured data
      /"image"\s*:\s*"([^"]+)"/i,
      /"image"\s*:\s*\[\s*"([^"]+)"/i,
      // Fallback: look for any img tag with likely thumbnail attributes
      /<img[^>]+src=["']([^"']*(?:thumb|preview|featured|hero|banner)[^"']*)["']/i
    ];
    
    for (const regex of thumbnailRegexes) {
      const match = html.match(regex);
      if (match && match[1]) {
        let imageUrl = match[1];
        //console.log(`Found potential thumbnail: ${imageUrl}`);
        
        // Handle relative URLs
        if (!imageUrl.startsWith('http')) {
          try {
            imageUrl = new URL(imageUrl, url).href;
            //console.log(`Converted to absolute URL: ${imageUrl}`);
          } catch (e) {
            //console.log(`Failed to convert relative URL: ${imageUrl}`);
            continue;
          }
        }
        
        // Validate image URL format (more permissive)
        if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || 
            imageUrl.includes('image') || 
            imageUrl.includes('photo') ||
            imageUrl.includes('thumb')) {
          //console.log(`Valid thumbnail found: ${imageUrl}`);
          return res.json({ thumbnail: imageUrl });
        }
      }
    }
    
    //console.log('No thumbnail found in HTML');
    res.json({ thumbnail: null });
    
  } catch (error) {
    console.error('Thumbnail fetch error:', error);
    
    // Handle specific error types with appropriate status codes
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Request timeout while fetching page' });
    }
    
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return res.status(503).json({ error: 'Network error while fetching page' });
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Unable to connect to the target server' });
    }
    
    // Generic server error for other cases
    res.status(500).json({ error: 'Internal server error while processing thumbnail' });
  }
});

// Database dump endpoint for debugging
app.get('/api/db-dump', async (req, res) => {
  try {
    const [feeds, categories, stories, apiKeys, reactions] = await Promise.all([
      database.getAllFeeds(),
      database.getAllCategories(),
      database.getAllStories(),
      database.getAllApiKeys(),
      database.getAllReactions()
    ]);
    
    res.json({
      feeds,
      categories,
      stories,
      apiKeys,
      reactions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database dump error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Database import endpoint
app.post('/api/db-import', async (req, res) => {
  try {
    const importData = req.body;
    
    // Validate import structure
    if (!importData.data || typeof importData.data !== 'object') {
      return res.status(400).json({ error: 'Invalid import format: missing data object' });
    }
    
    // WIPE ALL EXISTING DATA FIRST
    console.log('Wiping existing database data...');
    try {
      // Drop all tables to reset AUTOINCREMENT sequences
      await database.dropTables();
      
      // Recreate all tables with fresh AUTOINCREMENT sequences
      await database._initializeTables(false); // Skip default data during import
      
      console.log('Database wiped successfully');
    } catch (wipeError) {
      console.error('Error wiping database:', wipeError);
      return res.status(500).json({ error: 'Failed to wipe existing data: ' + wipeError.message });
    }
    
    // Additional verification: ensure tables are empty
    try {
      const categoryCount = await database._get('SELECT COUNT(*) as count FROM categories');
      console.log(`Categories table count after wipe: ${categoryCount.count}`);
      if (categoryCount.count > 0) {
        console.log('Force clearing categories table...');
        await database._run('DELETE FROM categories');
        await database._run('DELETE FROM sqlite_sequence WHERE name = "categories"');
      }
    } catch (verifyError) {
      console.error('Error verifying table cleanup:', verifyError);
    }
    
    let totalRecords = 0;
    let tablesProcessed = 0;
    const results = {};
    
    // Process each table in the import data
    for (const [tableName, tableData] of Object.entries(importData.data)) {
      if (!Array.isArray(tableData)) {
        console.warn(`Skipping ${tableName}: not an array`);
        continue;
      }
      
      try {
        let recordsImported = 0;
        
        // Handle different table types dynamically
        switch (tableName) {
          case 'categories':
            for (const record of tableData) {
              if (record.title) {
                // Preserve original UID if it exists
                if (record.uid) {
                  await database._run('INSERT OR IGNORE INTO categories (uid, title) VALUES (?, ?)', [record.uid, record.title]);
                } else {
                  await database.addCategory(record.title);
                }
                recordsImported++;
              }
            }
            break;
            
          case 'feeds':
            for (const record of tableData) {
              if (record.name && record.url) {
                // Preserve original UID if it exists
                if (record.uid) {
                  await database._run(
                    'INSERT OR IGNORE INTO feeds (uid, name, url, categories_uid, logo_url, last, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                      record.uid,
                      record.name,
                      record.url,
                      record.categories_uid || null,
                      record.logo_url || null,
                      record.last || null,
                      record.active !== undefined ? record.active : 1
                    ]
                  );
                } else {
                  await database.addFeed(
                    record.name,
                    record.url,
                    record.categories_uid || null,
                    record.logo_url || null
                  );
                }
                recordsImported++;
              }
            }
            break;
            
          case 'stories':
            for (const record of tableData) {
              if (record.title && record.link) {
                // Check if story already exists to avoid duplicates
                const exists = await database.checkStoryExists(record.link);
                if (!exists) {
                  // Preserve original UID if it exists
                  if (record.uid || record.UID) {
                    const storyUid = record.uid || record.UID;
                    await database._run(
                      'INSERT OR IGNORE INTO stories (uid, source_uid, categories_uid, title, link, published, visible, last) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                      [
                        storyUid,
                        record.source_uid || null,
                        record.categories_uid || null,
                        record.title,
                        record.link,
                        record.published || 0,
                        record.visible !== undefined ? record.visible : 1,
                        record.last || null
                      ]
                    );
                  } else {
                    await database.addStory(
                      record.source_uid || null,
                      record.categories_uid || null,
                      record.title,
                      record.link,
                      record.last || null
                    );
                  }
                  recordsImported++;
                }
              }
            }
            break;
            
          case 'apiKeys':
          case 'api':
            for (const record of tableData) {
              if (record.key_name) {
                await database.updateApiKey(record.key_name, record.key_value || '');
                recordsImported++;
              }
            }
            break;
            
          case 'reactions':
            for (const record of tableData) {
              if (record.type && record.prompt) {
                // Preserve original UID if it exists
                if (record.uid) {
                  await database._run('INSERT OR IGNORE INTO reactions (uid, type, prompt) VALUES (?, ?, ?)', [record.uid, record.type, record.prompt]);
                } else {
                  await database.addReaction(record.type, record.prompt);
                }
                recordsImported++;
              }
            }
            break;
            
          default:
            console.warn(`Unknown table type: ${tableName}, skipping...`);
            continue;
        }
        
        results[tableName] = recordsImported;
        totalRecords += recordsImported;
        tablesProcessed++;
        
      } catch (tableError) {
        console.error(`Error importing ${tableName}:`, tableError);
        results[tableName] = { error: tableError.message };
      }
    }
    
    // Update AUTOINCREMENT sequences for tables with UIDs to prevent conflicts
    try {
      const tablesToUpdate = ['categories', 'feeds', 'stories', 'reactions'];
      
      for (const tableName of tablesToUpdate) {
        if (results[tableName] && typeof results[tableName] === 'number' && results[tableName] > 0) {
          // Get the maximum UID from the imported data
          const maxUidResult = await database._get(`SELECT MAX(uid) as maxUid FROM ${tableName}`);
          if (maxUidResult && maxUidResult.maxUid) {
            // Update the sqlite_sequence table to set the next AUTOINCREMENT value
            await database._run(
              `UPDATE sqlite_sequence SET seq = ? WHERE name = ?`,
              [maxUidResult.maxUid, tableName]
            );
            console.log(`Updated AUTOINCREMENT sequence for ${tableName} to ${maxUidResult.maxUid}`);
          }
        }
      }
    } catch (sequenceError) {
      console.error('Error updating AUTOINCREMENT sequences:', sequenceError);
      // Don't fail the import for sequence update errors
    }
    
    res.json({
      success: true,
      totalRecords,
      tablesProcessed,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 3001;

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`RSS Reader server running on port ${PORT}`);
});