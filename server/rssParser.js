import Parser from 'rss-parser';

class RSSParser {
  constructor() {
    this.parser = new Parser();
  }

  async parseFeed(url) {
    try {
      const feed = await this.parser.parseURL(url);
      return {
        title: feed.title,
        description: feed.description,
        items: feed.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          content: item.content || item.summary || item.description
        }))
      };
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      throw error;
    }
  }

  async validateFeedUrl(url) {
    try {
      await this.parser.parseURL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default RSSParser;