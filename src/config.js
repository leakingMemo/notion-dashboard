const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

module.exports = {
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID,
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '127.0.0.1',
  },
  data: {
    refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '300000'), // 5 minutes
    cacheDuration: parseInt(process.env.CACHE_DURATION || '86400000'), // 24 hours
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: path.join(__dirname, '..', 'logs'),
  },
  paths: {
    root: path.join(__dirname, '..'),
    public: path.join(__dirname, '..', 'public'),
    charts: path.join(__dirname, '..', 'public', 'charts'),
    data: path.join(__dirname, '..', 'data'),
  },
};