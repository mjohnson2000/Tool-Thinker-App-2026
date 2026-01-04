#!/bin/bash

# Server Update Script for Tool Thinker
# Run this on your server to update to the latest version

set -e  # Exit on error

echo "🚀 Starting server update..."

# Navigate to project directory
cd ~/tool-thinker || { echo "❌ Error: ~/tool-thinker directory not found"; exit 1; }

# Stop PM2 process
echo "🛑 Stopping PM2 process..."
pm2 stop tool-thinker 2>/dev/null || true

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Start PM2 process
echo "▶️  Starting PM2 process..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo "✅ Server update complete!"
echo ""
echo "📊 App status:"
pm2 status

echo ""
echo "📝 Useful commands:"
echo "  View logs:    pm2 logs tool-thinker"
echo "  Monitor:      pm2 monit"
echo "  Restart:      pm2 restart tool-thinker"
echo "  Stop:         pm2 stop tool-thinker"

