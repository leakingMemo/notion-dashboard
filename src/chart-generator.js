const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const logger = require('./logger');

class ChartGenerator {
  constructor() {
    this.chartsDir = config.paths.charts;
  }

  async generateBalanceChart(accounts) {
    const chartData = this.prepareBalanceData(accounts);
    const html = this.createChartHTML('Account Balances', 'line', chartData);
    
    const filePath = path.join(this.chartsDir, 'balance.html');
    await this.saveChart(filePath, html);
    
    return '/charts/balance.html';
  }

  async generateAccountsChart(accounts) {
    const chartData = this.prepareAccountsData(accounts);
    const html = this.createChartHTML('Account Comparison', 'bar', chartData);
    
    const filePath = path.join(this.chartsDir, 'accounts.html');
    await this.saveChart(filePath, html);
    
    return '/charts/accounts.html';
  }

  async generatePortfolioChart(accounts) {
    const chartData = this.preparePortfolioData(accounts);
    const html = this.createChartHTML('Portfolio Distribution', 'doughnut', chartData);
    
    const filePath = path.join(this.chartsDir, 'portfolio.html');
    await this.saveChart(filePath, html);
    
    return '/charts/portfolio.html';
  }

  prepareBalanceData(accounts) {
    // Group by date and sum balances
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

  prepareAccountsData(accounts) {
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

  preparePortfolioData(accounts) {
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

  createChartHTML(title, type, data) {
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

        // Auto refresh every 5 minutes
        setTimeout(() => {
            location.reload();
        }, 5 * 60 * 1000);
    </script>
</body>
</html>`;
  }

  async saveChart(filePath, html) {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, html);
      logger.info(`Chart saved to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving chart to ${filePath}:`, error);
      throw error;
    }
  }
}

module.exports = ChartGenerator;