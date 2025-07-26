#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// For GitHub Pages, we'll generate with mock data
// You can replace this with real Notion data when you have a working API key

async function generateMockData() {
  const accountTypes = ['Checking', 'Savings', 'Investment', 'Credit Card'];
  const accounts = [];
  
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

function prepareBalanceData(accounts) {
  const balanceByDate = {};
  
  accounts.forEach(account => {
    const date = new Date(account.lastEditedTime).toLocaleDateString();
    if (!balanceByDate[date]) {
      balanceByDate[date] = 0;
    }
    balanceByDate[date] += account.limit;
  });

  return {
    labels: Object.keys(balanceByDate),
    datasets: [{
      label: 'Total Balance',
      data: Object.values(balanceByDate),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };
}

function prepareAccountsData(accounts) {
  return {
    labels: accounts.map(a => a.name),
    datasets: [{
      label: 'Balance',
      data: accounts.map(a => a.limit),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1
    }]
  };
}

function preparePortfolioData(accounts) {
  const byType = {};
  
  accounts.forEach(account => {
    const type = account.subtype || 'Other';
    if (!byType[type]) {
      byType[type] = 0;
    }
    byType[type] += account.limit;
  });

  return {
    labels: Object.keys(byType),
    datasets: [{
      label: 'Amount',
      data: Object.values(byType),
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
      ],
      hoverOffset: 4
    }]
  };
}

function createChartHTML(title, type, data) {
  const formatOptions = type === 'doughnut' ? '' : `
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        },`;

  return `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
        }
        .chart-container {
            position: relative;
            height: 400px;
            max-width: 800px;
            margin: 0 auto;
        }
        .last-updated {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <canvas id="chart"></canvas>
    </div>
    <div class="last-updated">
        Last updated: ${new Date().toLocaleString()}
    </div>
    
    <script>
        const ctx = document.getElementById('chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: '${type}',
            data: ${JSON.stringify(data, null, 2)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '${title}'
                    }
                },${formatOptions}
            }
        });
    </script>
</body>
</html>`;
}

async function generateCharts() {
  console.log('Generating static charts...');
  
  try {
    // Create directories
    await fs.mkdir('public', { recursive: true });
    await fs.mkdir('public/charts', { recursive: true });
    
    // Generate mock data
    const accounts = await generateMockData();
    
    // Generate chart HTMLs
    const balanceHTML = createChartHTML('Account Balances', 'line', prepareBalanceData(accounts));
    const accountsHTML = createChartHTML('Account Comparison', 'bar', prepareAccountsData(accounts));
    const portfolioHTML = createChartHTML('Portfolio Distribution', 'doughnut', preparePortfolioData(accounts));
    
    // Save charts
    await fs.writeFile('public/charts/balance.html', balanceHTML);
    await fs.writeFile('public/charts/accounts.html', accountsHTML);
    await fs.writeFile('public/charts/portfolio.html', portfolioHTML);
    
    // Create index.html
    const indexHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Notion Dashboard Charts</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-top: 30px;
        }
        .chart-link {
            display: block;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: background 0.2s;
        }
        .chart-link:hover {
            background: #e9e9e9;
        }
        .chart-link h2 {
            margin: 0 0 10px 0;
        }
        .chart-link p {
            margin: 0;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Notion Dashboard Charts</h1>
    <div class="charts-grid">
        <a href="charts/balance.html" class="chart-link">
            <h2>Account Balances</h2>
            <p>View balance trends over time</p>
        </a>
        <a href="charts/accounts.html" class="chart-link">
            <h2>Account Comparison</h2>
            <p>Compare balances across accounts</p>
        </a>
        <a href="charts/portfolio.html" class="chart-link">
            <h2>Portfolio Distribution</h2>
            <p>See distribution by account type</p>
        </a>
    </div>
    <p style="text-align: center; margin-top: 40px; color: #666;">
        Last updated: ${new Date().toLocaleString()}
    </p>
</body>
</html>`;
    
    await fs.writeFile('public/index.html', indexHTML);
    
    console.log('Charts generated successfully!');
    console.log('Files created:');
    console.log('  - public/index.html');
    console.log('  - public/charts/balance.html');
    console.log('  - public/charts/accounts.html');
    console.log('  - public/charts/portfolio.html');
    
  } catch (error) {
    console.error('Error generating charts:', error);
    process.exit(1);
  }
}

// Run the generator
generateCharts();