# Notion Dashboard - Local Chart Server Plan

## Overview
A privacy-focused solution for displaying real-time financial charts in Notion by running a local server that fetches data from your Notion database (synced via Finta) and serves interactive charts.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│    Finta    │────▶│    Notion    │◀────│  Local Server   │────▶│ Chart HTML   │
│ (Bank Data) │     │  Database    │     │ (Node.js/Express)│     │ (localhost)  │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘
                            ▲                                              │
                            │                                              ▼
                            └──────────────────────────────────────┬──────────────┐
                                                                   │ Notion Page  │
                                                                   │   (Embed)    │
                                                                   └──────────────┘
```

## Implementation Plan

### Phase 1: Core Server Setup

#### 1.1 Project Structure
```
notion-dashboard/
├── plan/
│   └── local-chart-server-plan.md
├── src/
│   ├── server.js           # Express server
│   ├── notion-client.js    # Notion API wrapper
│   ├── chart-generator.js  # Chart generation logic
│   └── config.js          # Configuration
├── public/
│   └── charts/            # Generated chart HTML
├── scripts/
│   └── setup-launchd.sh   # Auto-start setup
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

#### 1.2 Dependencies
- `express` - Web server
- `@notionhq/client` - Notion API
- `chart.js` - Chart generation
- `node-cron` - Scheduled data fetching
- `dotenv` - Environment variables
- `winston` - Logging

### Phase 2: Notion Integration

#### 2.1 Data Fetching
- Connect to Notion API using integration token
- Query the Accounts database
- Extract relevant fields:
  - Account Name
  - Account Balance/Limit
  - Currency
  - Timestamps
  - Account Type

#### 2.2 Data Processing
- Parse and normalize data
- Calculate trends and aggregations
- Handle multiple accounts
- Cache data locally for offline access

### Phase 3: Chart Generation

#### 3.1 Chart Types
- Line chart for balance over time
- Bar chart for account comparisons
- Pie chart for portfolio distribution
- Gauge chart for spending limits

#### 3.2 Dynamic HTML Generation
- Server-side rendered HTML with Chart.js
- Responsive design for Notion embedding
- Auto-refresh via JavaScript
- Dark mode support matching Notion theme

### Phase 4: Local Server Implementation

#### 4.1 Server Endpoints
- `GET /` - Health check
- `GET /charts/balance` - Balance over time chart
- `GET /charts/accounts` - Account comparison
- `GET /charts/portfolio` - Portfolio distribution
- `GET /api/refresh` - Force data refresh

#### 4.2 Security Features
- CORS restricted to localhost only
- No external access (bind to 127.0.0.1)
- API key stored in environment variables
- Request rate limiting

### Phase 5: Auto-Start Service

#### 5.1 macOS LaunchAgent
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.notion.dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/nathandsouza/git/notion-dashboard/src/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

#### 5.2 Service Management
- Auto-start on login
- Restart on crash
- Log rotation
- Status monitoring

### Phase 6: Notion Page Setup

#### 6.1 Embedding Charts
1. Add embed blocks to Notion page
2. Use localhost URLs:
   - `http://localhost:3000/charts/balance`
   - `http://localhost:3000/charts/accounts`
3. Configure block sizes
4. Arrange in dashboard layout

## Configuration

### Environment Variables
```env
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxx-xxx-xxx
PORT=3000
REFRESH_INTERVAL=300000  # 5 minutes
CACHE_DURATION=86400000  # 24 hours
```

### Notion Integration Setup
1. Create internal integration at https://www.notion.so/my-integrations
2. Grant access to Accounts database
3. Copy integration token

## Data Flow

1. **Initial Load**
   - Server starts and fetches all account data
   - Generates initial charts
   - Caches data locally

2. **Periodic Updates**
   - Cron job runs every 5 minutes
   - Fetches latest data from Notion
   - Updates charts if data changed

3. **On-Demand Refresh**
   - Manual refresh endpoint
   - Triggered via API or button

## Security Considerations

1. **Local Only Access**
   - Server binds to 127.0.0.1
   - No external network access
   - Firewall rules (optional)

2. **Credential Management**
   - API keys in .env file
   - Never commit credentials
   - Use macOS Keychain (future)

3. **Data Privacy**
   - No external services
   - No analytics or tracking
   - Local caching only

## Future Enhancements

1. **Advanced Charts**
   - Spending categories
   - Budget tracking
   - Predictive trends

2. **Mobile Support**
   - Tailscale/WireGuard for secure remote access
   - Progressive Web App

3. **Additional Integrations**
   - Multiple Notion databases
   - Export functionality
   - Alerts and notifications

## Development Workflow

1. Clone repository
2. Copy `.env.example` to `.env`
3. Add Notion credentials
4. Install dependencies: `npm install`
5. Start development: `npm run dev`
6. Set up auto-start: `npm run setup-service`

## Troubleshooting

### Common Issues
- **Charts not loading**: Check if server is running (`ps aux | grep node`)
- **No data**: Verify Notion API access and database ID
- **Permission denied**: Check LaunchAgent permissions
- **Port in use**: Change PORT in .env file

### Logs
- Server logs: `~/Library/Logs/notion-dashboard/`
- LaunchAgent logs: `/var/log/system.log`

## Resources

- [Notion API Documentation](https://developers.notion.com)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [launchd.info](https://launchd.info/)