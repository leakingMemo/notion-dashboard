const { Client } = require('@notionhq/client');
const config = require('./config');
const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');

class NotionClient {
  constructor() {
    if (!config.notion.apiKey) {
      throw new Error('NOTION_API_KEY is required');
    }
    
    this.client = new Client({
      auth: config.notion.apiKey,
    });
    
    this.databaseId = config.notion.databaseId;
    this.cacheFile = path.join(config.paths.data, 'notion-cache.json');
  }

  async fetchAccountData() {
    try {
      logger.info('Fetching data from Notion database');
      
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'ascending',
          },
        ],
      });

      const accounts = response.results.map(page => this.extractAccountInfo(page));
      
      // Cache the data
      await this.cacheData(accounts);
      
      logger.info(`Fetched ${accounts.length} accounts from Notion`);
      return accounts;
    } catch (error) {
      logger.error('Error fetching from Notion:', error);
      
      // Try to return cached data on error
      const cached = await this.getCachedData();
      if (cached) {
        logger.info('Returning cached data due to fetch error');
        return cached;
      }
      
      throw error;
    }
  }

  extractAccountInfo(page) {
    const properties = page.properties;
    
    return {
      id: page.id,
      name: this.getTextProperty(properties['Account Name']),
      currency: this.getSelectProperty(properties['Account Currency']),
      limit: this.getNumberProperty(properties['Account Limit']),
      mask: this.getTextProperty(properties['Account Mask']),
      subtype: this.getSelectProperty(properties['Account Subtype']),
      available: this.getNumberProperty(properties['Available']),
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
    };
  }

  getTextProperty(property) {
    if (!property) return '';
    
    if (property.type === 'title') {
      return property.title[0]?.plain_text || '';
    }
    if (property.type === 'rich_text') {
      return property.rich_text[0]?.plain_text || '';
    }
    return '';
  }

  getNumberProperty(property) {
    if (!property || property.type !== 'number') return 0;
    return property.number || 0;
  }

  getSelectProperty(property) {
    if (!property || property.type !== 'select') return '';
    return property.select?.name || '';
  }

  async cacheData(data) {
    try {
      await fs.mkdir(config.paths.data, { recursive: true });
      await fs.writeFile(this.cacheFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        data: data
      }, null, 2));
      logger.info('Data cached successfully');
    } catch (error) {
      logger.error('Error caching data:', error);
    }
  }

  async getCachedData() {
    try {
      const cached = await fs.readFile(this.cacheFile, 'utf8');
      const { timestamp, data } = JSON.parse(cached);
      
      // Check if cache is still valid
      const cacheAge = Date.now() - new Date(timestamp).getTime();
      if (cacheAge < config.data.cacheDuration) {
        return data;
      }
    } catch (error) {
      logger.debug('No valid cache found');
    }
    return null;
  }
}

module.exports = NotionClient;