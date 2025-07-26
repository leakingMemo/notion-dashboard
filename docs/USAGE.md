# Usage Guide

## Prerequisites

1. Node.js installed on your system
2. A Notion integration with access to your database
3. Your Notion database ID

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `NOTION_API_KEY`: Your Notion integration token
- `NOTION_DATABASE_ID`: The ID of your Accounts database

### 3. Find Your Notion Database ID

1. Open your Notion database in a browser
2. Look at the URL: `https://www.notion.so/[workspace]/[database-id]?v=[view-id]`
3. The database ID is the 32-character string after your workspace name

### 4. Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Dashboard Charts")
4. Submit to create the integration
5. Copy the "Internal Integration Token"
6. Share your database with the integration:
   - Open your database in Notion
   - Click "..." menu → "Add connections"
   - Search for your integration name and add it

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Auto-start on Login (macOS)

```bash
npm run setup-service
```

To uninstall the auto-start service:

```bash
npm run uninstall-service
```

## Embedding Charts in Notion

1. Open your Notion page where you want the charts
2. Type `/embed`
3. Enter one of these URLs:
   - `http://localhost:3000/charts/balance.html`
   - `http://localhost:3000/charts/accounts.html`
   - `http://localhost:3000/charts/portfolio.html`
4. Press Enter
5. Resize the embed block as needed

## Chart Types

### Balance Chart
Shows your account balances over time as a line chart.

### Accounts Chart
Compares balances across different accounts as a bar chart.

### Portfolio Chart
Shows distribution of funds by account type as a doughnut chart.

## Troubleshooting

### Charts not loading in Notion

1. Check if the server is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check server logs:
   ```bash
   tail -f logs/combined.log
   ```

3. Verify Notion integration has access to your database

### No data showing

1. Check your `.env` configuration
2. Verify the database ID is correct
3. Ensure the integration has access to your database
4. Check error logs for API issues

### Server won't start

1. Check if port 3000 is already in use
2. Verify Node.js is installed: `node --version`
3. Check for missing dependencies: `npm install`

## Manual Data Refresh

To force a data refresh without waiting for the scheduled update:

```bash
curl http://localhost:3000/api/refresh
```

## Security Notes

- The server only binds to localhost (127.0.0.1)
- No external access is possible by default
- Your Notion API key is never exposed to the browser
- Data is cached locally for offline access