import { WebSocketServer as WSServer } from 'ws';

class WebSocketServer {
  constructor(server, database, rssParser) {
    this.wss = new WSServer({ server });
    this.database = database;
    this.rssParser = rssParser;
    this.clients = new Set();
    
    this.setupWebSocket();
    this.startFeedPolling();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      this.clients.add(ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
          
          // Check for disk I/O errors and attempt database reconnection
          if (error.message && error.message.includes('disk I/O error')) {
            console.log('Detected disk I/O error, attempting database reconnection...');
            try {
              await this.database.reconnect();
              console.log('Database reconnected successfully, sending updated data...');
              
              // Send updated data to all clients after reconnection
              this.sendInitialDataToAll();
              
              ws.send(JSON.stringify({ 
                type: 'info', 
                message: 'Database connection restored successfully' 
              }));
            } catch (reconnectError) {
              console.error('Failed to reconnect database:', reconnectError);
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Database connection failed. Please refresh the page.' 
              }));
            }
          } else {
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
          }
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('WebSocket connection closed');
      });

      // Send initial data
      this.sendInitialData(ws);
    });
  }

  async sendInitialData(ws) {
    try {
      const results = await Promise.allSettled([
        this.database.getAllFeeds(),
        this.database.getAllCategories(),
        this.database.getAllStories(),
        this.database.getAllApiKeys(),
        this.database.getAllReactions()
      ]);

      const feeds = results[0].status === 'fulfilled' ? results[0].value : [];
      const categories = results[1].status === 'fulfilled' ? results[1].value : [];
      const stories = results[2].status === 'fulfilled' ? results[2].value : [];
      const apiKeys = results[3].status === 'fulfilled' ? results[3].value : [];
      const reactions = results[4].status === 'fulfilled' ? results[4].value : [];

      ws.send(JSON.stringify({
        type: 'initial_data',
        data: { feeds, categories, stories, apiKeys, reactions }
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  // Helper method to send initial data to all connected clients
  async sendInitialDataToAll() {
    try {
      const results = await Promise.allSettled([
        this.database.getAllFeeds(),
        this.database.getAllCategories(),
        this.database.getAllStories(),
        this.database.getAllApiKeys(),
        this.database.getAllReactions()
      ]);

      const feeds = results[0].status === 'fulfilled' ? results[0].value : [];
      const categories = results[1].status === 'fulfilled' ? results[1].value : [];
      const stories = results[2].status === 'fulfilled' ? results[2].value : [];
      const apiKeys = results[3].status === 'fulfilled' ? results[3].value : [];
      const reactions = results[4].status === 'fulfilled' ? results[4].value : [];

      const message = JSON.stringify({
        type: 'initial_data',
        data: { feeds, categories, stories, apiKeys, reactions }
      });

      this.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error sending initial data to all clients:', error);
    }
  }

  async handleMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'add_feed':
        await this.handleAddFeed(payload);
        break;
      case 'update_feed':
        await this.handleUpdateFeed(payload);
        break;
      case 'delete_feed':
        await this.handleDeleteFeed(payload);
        break;
      case 'add_category':
        await this.handleAddCategory(payload);
        break;
      case 'update_category':
        await this.handleUpdateCategory(payload);
        break;
      case 'delete_category':
        await this.handleDeleteCategory(payload);
        break;
      case 'update_story_visibility':
        await this.handleUpdateStoryVisibility(payload);
        break;
      case 'update_story_published':
        await this.handleUpdateStoryPublished(payload);
        break;
      case 'refresh_feeds':
        await this.refreshAllFeeds();
        break;
      case 'purge_all_stories':
        await this.handlePurgeAllStories();
        break;
      case 'purge_category_stories':
        await this.handlePurgeCategoryStories(payload);
        break;
      case 'purge_all_stories':
        await this.handlePurgeAllStories();
        break;
      case 'purge_category_stories':
        await this.handlePurgeCategoryStories(payload);
        break;
      case 'purge_old_stories':
        await this.handlePurgeOldStories(payload);
        break;
      case 'purge_source_stories':
        await this.handlePurgeSourceStories(payload);
        break;
      case 'update_api_key':
        await this.handleUpdateApiKey(payload);
        break;
      case 'add_reaction':
        await this.handleAddReaction(payload);
        break;
      case 'update_reaction':
        await this.handleUpdateReaction(payload);
        break;
      case 'delete_reaction':
        await this.handleDeleteReaction(payload);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  async handleAddFeed(payload) {
    try {
      const { name, url, categories_uid, logo_url } = payload;
      const isValid = await this.rssParser.validateFeedUrl(url);
      
      if (!isValid) {
        this.broadcast({ type: 'error', message: 'Invalid RSS feed URL' });
        return;
      }

      const feedId = await this.database.addFeed(name, url, categories_uid, logo_url);
      const feeds = await this.database.getAllFeeds();
      this.broadcast({ type: 'feeds_updated', data: feeds });
      
      // Parse and add stories from the new feed
      await this.parseFeedStories(feedId, url, categories_uid);
    } catch (error) {
      console.error('Error adding feed:', error);
      this.broadcast({ type: 'error', message: 'Failed to add feed: ' + error.message });
    }
  }

  async handleUpdateFeed(payload) {
    const { uid, name, url, active, categories_uid, logo_url } = payload;
    await this.database.updateFeed(uid, name, url, active, categories_uid, logo_url);
    const feeds = await this.database.getAllFeeds();
    const stories = await this.database.getAllStories();
    this.broadcast({ type: 'feeds_updated', data: feeds });
    this.broadcast({ type: 'stories_updated', data: stories });
  }

  async handleDeleteFeed(payload) {
    const { uid } = payload;
    await this.database.deleteFeed(uid);
    const feeds = await this.database.getAllFeeds();
    this.broadcast({ type: 'feeds_updated', data: feeds });
  }

  async handleAddCategory(payload) {
    const { title } = payload;
    await this.database.addCategory(title);
    const categories = await this.database.getAllCategories();
    this.broadcast({ type: 'categories_updated', data: categories });
  }

  async handleUpdateCategory(payload) {
    const { uid, title } = payload;
    await this.database.updateCategory(uid, title);
    const categories = await this.database.getAllCategories();
    this.broadcast({ type: 'categories_updated', data: categories });
  }

  async handleDeleteCategory(payload) {
    const { uid } = payload;
    await this.database.deleteCategory(uid);
    const categories = await this.database.getAllCategories();
    this.broadcast({ type: 'categories_updated', data: categories });
  }

  async handleUpdateStoryVisibility(payload) {
    const { uid, visible } = payload;
    await this.database.updateStoryVisibility(uid, visible);
    const stories = await this.database.getAllStories();
    this.broadcast({ type: 'stories_updated', data: stories });
  }

  async handleUpdateStoryPublished(payload) {
    const { uid, published } = payload;
    await this.database.updateStoryPublished(uid, published);
    const stories = await this.database.getAllStories();
    this.broadcast({ type: 'stories_updated', data: stories });
  }

  async handlePurgeAllStories() {
    try {
      const deletedCount = await this.database.purgeAllStories();
      console.log(`Purged ${deletedCount} stories from database`);
      
      const stories = await this.database.getAllStories();
      this.broadcast({ type: 'stories_updated', data: stories });
      this.broadcast({ 
        type: 'purge_completed', 
        data: { deletedCount, type: 'all' } 
      });
    } catch (error) {
      console.error('Error purging all stories:', error);
      this.broadcast({ type: 'error', message: 'Failed to purge stories: ' + error.message });
    }
  }

  async handlePurgeCategoryStories(payload) {
    try {
      const { categories_uid } = payload;
      const deletedCount = await this.database.purgeCategoryStories(categories_uid);
      console.log(`Purged ${deletedCount} stories from category ${categories_uid}`);
      
      const stories = await this.database.getAllStories();
      this.broadcast({ type: 'stories_updated', data: stories });
      this.broadcast({ 
        type: 'purge_completed', 
        data: { deletedCount, type: 'category', categories_uid } 
      });
    } catch (error) {
      console.error('Error purging category stories:', error);
      this.broadcast({ type: 'error', message: 'Failed to purge category stories: ' + error.message });
    }
  }

  async handlePurgeOldStories(payload) {
    try {
      const { days } = payload;
      const deletedCount = await this.database.purgeOldStories(days);
      console.log(`Purged ${deletedCount} stories older than ${days} days`);
      
      const stories = await this.database.getAllStories();
      this.broadcast({ type: 'stories_updated', data: stories });
      this.broadcast({ 
        type: 'purge_completed', 
        data: { deletedCount, type: 'old_stories', days } 
      });
    } catch (error) {
      console.error('Error purging old stories:', error);
      this.broadcast({ type: 'error', message: 'Failed to purge old stories: ' + error.message });
    }
  }

  async handlePurgeSourceStories(payload) {
    try {
      const { source_uid } = payload;
      const deletedCount = await this.database.purgeSourceStories(source_uid);
      console.log(`Purged ${deletedCount} stories from source ${source_uid}`);
      
      const stories = await this.database.getAllStories();
      this.broadcast({ type: 'stories_updated', data: stories });
      this.broadcast({ 
        type: 'purge_completed', 
        data: { deletedCount, type: 'source', source_uid } 
      });
    } catch (error) {
      console.error('Error purging source stories:', error);
      this.broadcast({ type: 'error', message: 'Failed to purge source stories: ' + error.message });
    }
  }

  async handleUpdateApiKey(payload) {
    try {
      const { keyName, keyValue } = payload;
      await this.database.updateApiKey(keyName, keyValue);
      const apiKeys = await this.database.getAllApiKeys();
      this.broadcast({ type: 'api_keys_updated', data: apiKeys });
    } catch (error) {
      console.error('Error updating API key:', error);
      this.broadcast({ type: 'error', message: 'Failed to update API key: ' + error.message });
    }
  }

  async handleAddReaction(payload) {
    try {
      const { type, prompt } = payload;
      await this.database.addReaction(type, prompt);
      const reactions = await this.database.getAllReactions();
      this.broadcast({ type: 'reactions_updated', data: reactions });
    } catch (error) {
      console.error('Error adding reaction:', error);
      this.broadcast({ type: 'error', message: 'Failed to add reaction: ' + error.message });
    }
  }

  async handleUpdateReaction(payload) {
    try {
      const { uid, type, prompt } = payload;
      await this.database.updateReaction(uid, type, prompt);
      const reactions = await this.database.getAllReactions();
      this.broadcast({ type: 'reactions_updated', data: reactions });
    } catch (error) {
      console.error('Error updating reaction:', error);
      this.broadcast({ type: 'error', message: 'Failed to update reaction: ' + error.message });
    }
  }

  async handleDeleteReaction(payload) {
    try {
      const { uid } = payload;
      await this.database.deleteReaction(uid);
      const reactions = await this.database.getAllReactions();
      this.broadcast({ type: 'reactions_updated', data: reactions });
    } catch (error) {
      console.error('Error deleting reaction:', error);
      this.broadcast({ type: 'error', message: 'Failed to delete reaction: ' + error.message });
    }
  }

  async parseFeedStories(feedId, url, categoryId = null) {
    try {
      const feedData = await this.rssParser.parseFeed(url);
      
      if (!categoryId) {
        const defaultCategory = await this.database.getAllCategories();
        categoryId = defaultCategory[0]?.uid || 1;
      }

      let newStoriesCount = 0;
      for (const item of feedData.items) {
        try {
          // Check if story already exists
          const exists = await this.database.checkStoryExists(item.link);
          if (!exists) {
            await this.database.addStory(feedId, categoryId, item.title, item.link, item.pubDate);
            newStoriesCount++;
          }
        } catch (storyError) {
          console.error(`Error processing story "${item.title}":`, storyError.message);
          continue; // Skip this story and continue with others
        }
      }

      if (newStoriesCount > 0) {
        console.log(`Added ${newStoriesCount} new stories from feed: ${url}`);
        const stories = await this.database.getAllStories();
        this.broadcast({ type: 'stories_updated', data: stories });
      }

      return newStoriesCount;
    } catch (error) {
      console.error('Error parsing feed stories:', error);
      return 0;
    }
  }

  async refreshAllFeeds() {
    try {
      console.log('Starting scheduled feed refresh...');
      this.broadcast({ type: 'refresh_started' });
      
      let feeds;
      try {
        feeds = await this.database.getAllFeeds();
      } catch (dbError) {
        console.error('Database error getting feeds:', dbError);
        this.broadcast({ 
          type: 'refresh_completed', 
          data: { newStoriesCount: 0, error: 'Database connection error' } 
        });
        return;
      }
      
      let totalNewStories = 0;
      
      for (const feed of feeds) {
        if (feed.active) {
          try {
            const newStories = await this.parseFeedStories(feed.uid, feed.url, feed.categories_uid);
            totalNewStories += newStories;
            // Add small delay between feeds to prevent overwhelming
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (feedError) {
            console.error(`Error refreshing feed "${feed.name}":`, feedError.message);
            continue; // Skip this feed and continue with others
          }
        }
      }
      
      console.log(`Feed refresh completed. Added ${totalNewStories} new stories total.`);
      this.broadcast({ 
        type: 'refresh_completed', 
        data: { newStoriesCount: totalNewStories } 
      });
    } catch (error) {
      console.error('Error during feed refresh:', error);
      this.broadcast({ 
        type: 'refresh_completed', 
        data: { newStoriesCount: 0, error: error.message } 
      });
    }
  }

  startFeedPolling() {
    // Refresh feeds every 10 minutes
    console.log('Starting feed polling every 10 minutes...');
    setInterval(async () => {
      await this.refreshAllFeeds();
    }, 10 * 60 * 1000);
    
    // Also run an initial refresh after 30 seconds to populate feeds
    setTimeout(async () => {
      console.log('Running initial feed refresh...');
      await this.refreshAllFeeds();
    }, 30000);
  }

  broadcast(message) {
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export default WebSocketServer;