# Notion Dashboard

A local server that generates real-time charts from your Notion database and serves them for embedding in Notion pages. Perfect for visualizing financial data synced from Finta or any other Notion database.

## Features

- 🔒 **Privacy-first**: Runs locally on your machine, no external hosting
- 📊 **Real-time charts**: Automatically fetches latest data from Notion
- 🔄 **Auto-refresh**: Updates charts at configurable intervals
- 🚀 **Auto-start**: Launches automatically when you log in
- 📱 **Responsive**: Charts adapt to Notion's embed sizes

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/notion-dashboard.git
   cd notion-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Notion integration:
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the integration token
   - Share your database with the integration

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Notion credentials
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Embed in Notion:
   - In your Notion page, type `/embed`
   - Enter `http://localhost:3000/charts/balance`
   - Resize as needed

## Documentation

See the [planning document](plan/local-chart-server-plan.md) for detailed architecture and implementation details.

## License

MIT