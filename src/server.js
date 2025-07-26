const express = require('express');
const path = require('path');
const cron = require('node-cron');
const config = require('./config');
const logger = require('./logger');
const NotionClient = require('./notion-client');
const ChartGenerator = require('./chart-generator');

const app = express();
const notionClient = new NotionClient();
const chartGenerator = new ChartGenerator();

// Middleware
app.use(express.json());
app.use(express.static(config.paths.public));

// CORS - Only allow localhost
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notion-dashboard',
    endpoints: [
      '/health',
      '/charts/balance',
      '/charts/accounts',
      '/charts/portfolio',
      '/api/refresh'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/refresh', async (req, res) => {
  try {
    await refreshData();
    res.json({ status: 'success', message: 'Data refreshed successfully' });
  } catch (error) {
    logger.error('Error in manual refresh:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Chart routes are served statically from public/charts/

// Data refresh function
async function refreshData() {
  try {
    logger.info('Starting data refresh');
    
    // Fetch latest data from Notion
    const accounts = await notionClient.fetchAccountData();
    
    // Generate charts
    await Promise.all([
      chartGenerator.generateBalanceChart(accounts),
      chartGenerator.generateAccountsChart(accounts),
      chartGenerator.generatePortfolioChart(accounts)
    ]);
    
    logger.info('Data refresh completed successfully');
  } catch (error) {
    logger.error('Error during data refresh:', error);
    throw error;
  }
}

// Initial data load
async function initialize() {
  try {
    logger.info('Initializing Notion Dashboard server');
    
    // Check if we have required config
    if (!config.notion.apiKey || !config.notion.databaseId) {
      throw new Error('Missing required configuration. Please check your .env file.');
    }
    
    // Initial data refresh
    await refreshData();
    
    // Schedule periodic updates
    const schedule = `*/${config.data.refreshInterval / 60000} * * * *`; // Convert ms to minutes
    cron.schedule(schedule, () => {
      logger.info('Running scheduled data refresh');
      refreshData().catch(error => {
        logger.error('Scheduled refresh failed:', error);
      });
    });
    
    logger.info(`Scheduled data refresh every ${config.data.refreshInterval / 60000} minutes`);
    
    // Start server
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`Server running at http://${config.server.host}:${config.server.port}`);
      console.log(`
🚀 Notion Dashboard Server Started!
   
   URL: http://${config.server.host}:${config.server.port}
   
   Available charts:
   - http://${config.server.host}:${config.server.port}/charts/balance.html
   - http://${config.server.host}:${config.server.port}/charts/accounts.html
   - http://${config.server.host}:${config.server.port}/charts/portfolio.html
   
   Embed these URLs in your Notion page using the /embed command.
      `);
    });
    
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
initialize();