const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const ChartGenerator = require('./chart-generator');

const app = express();
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

// Mock data generator
function generateMockData() {
  const accountTypes = ['Checking', 'Savings', 'Investment', 'Credit Card'];
  const accounts = [];
  
  // Generate data for the last 30 days
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const baseBalance = 5000 + Math.random() * 20000;
    accounts.push({
      id: `account-${i}`,
      name: `${accountTypes[i % accountTypes.length]} Account ${i + 1}`,
      currency: 'USD',
      limit: Math.round(baseBalance),
      mask: `***${1000 + i}`,
      subtype: accountTypes[i % accountTypes.length],
      available: Math.round(baseBalance * 0.95),
      createdTime: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastEditedTime: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return accounts;
}

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notion-dashboard (mock mode)',
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
    mode: 'mock',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/refresh', async (req, res) => {
  try {
    await refreshData();
    res.json({ status: 'success', message: 'Mock data refreshed successfully' });
  } catch (error) {
    logger.error('Error in manual refresh:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Data refresh function
async function refreshData() {
  try {
    logger.info('Generating mock data');
    
    // Generate mock data
    const accounts = generateMockData();
    
    // Generate charts
    await Promise.all([
      chartGenerator.generateBalanceChart(accounts),
      chartGenerator.generateAccountsChart(accounts),
      chartGenerator.generatePortfolioChart(accounts)
    ]);
    
    logger.info('Mock data refresh completed successfully');
  } catch (error) {
    logger.error('Error during mock data refresh:', error);
    throw error;
  }
}

// Initialize
async function initialize() {
  try {
    logger.info('Initializing Notion Dashboard server (mock mode)');
    
    // Initial data refresh
    await refreshData();
    
    // Start server
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`Mock server running at http://${config.server.host}:${config.server.port}`);
      console.log(`
🚀 Notion Dashboard Mock Server Started!
   
   This is running with sample data since the API tokens aren't working.
   
   URL: http://${config.server.host}:${config.server.port}
   
   Available charts:
   - http://${config.server.host}:${config.server.port}/charts/balance.html
   - http://${config.server.host}:${config.server.port}/charts/accounts.html
   - http://${config.server.host}:${config.server.port}/charts/portfolio.html
   
   Embed these URLs in your Notion page using the /embed command.
      `);
    });
    
  } catch (error) {
    logger.error('Failed to initialize mock server:', error);
    console.error('❌ Failed to start mock server:', error.message);
    process.exit(1);
  }
}

// Start the server
initialize();