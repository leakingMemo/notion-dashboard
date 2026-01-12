#!/bin/bash

# Setup script for macOS LaunchAgent

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PLIST_NAME="com.notion.dashboard.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"
NODE_PATH="$(which node)"

echo "🚀 Setting up Notion Dashboard LaunchAgent..."

# Check if Node.js is installed
if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Create the plist file
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.notion.dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$PROJECT_DIR/src/server.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ LaunchAgent plist created at: $PLIST_PATH"

# Load the LaunchAgent
launchctl load "$PLIST_PATH" 2>/dev/null
launchctl start com.notion.dashboard

echo "✅ LaunchAgent loaded and started"
echo ""
echo "📝 Useful commands:"
echo "   Start:   launchctl start com.notion.dashboard"
echo "   Stop:    launchctl stop com.notion.dashboard"
echo "   Status:  launchctl list | grep notion"
echo "   Unload:  launchctl unload $PLIST_PATH"
echo "   Logs:    tail -f $PROJECT_DIR/logs/launchd.log"
echo ""
echo "🎉 Setup complete! The server will now start automatically on login."