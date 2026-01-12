#!/bin/bash

# Uninstall script for macOS LaunchAgent

PLIST_NAME="com.notion.dashboard.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "🛑 Uninstalling Notion Dashboard LaunchAgent..."

# Stop and unload the service
launchctl stop com.notion.dashboard 2>/dev/null
launchctl unload "$PLIST_PATH" 2>/dev/null

# Remove the plist file
if [ -f "$PLIST_PATH" ]; then
    rm "$PLIST_PATH"
    echo "✅ LaunchAgent removed"
else
    echo "ℹ️  LaunchAgent not found"
fi

echo "✅ Uninstall complete"