#!/bin/bash

# Deployment script for Tool Thinker
# This script builds and starts the app with PM2

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing..."
    npm install -g pm2
fi

# Check if .env exists
if [ ! -f .env ] && [ ! -f .env.production ]; then
    echo "⚠️  Warning: No .env file found. Make sure to set up environment variables!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building the app..."
npm run build

# Stop existing PM2 process if running
echo "🛑 Stopping existing process (if any)..."
pm2 stop tool-thinker 2>/dev/null || true
pm2 delete tool-thinker 2>/dev/null || true

# Start with PM2
echo "▶️  Starting app with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 App status:"
pm2 status

echo ""
echo "📝 Useful commands:"
echo "  View logs:    pm2 logs tool-thinker"
echo "  Monitor:      pm2 monit"
echo "  Restart:      pm2 restart tool-thinker"
echo "  Stop:         pm2 stop tool-thinker"
echo ""
echo "🔗 Health check: http://localhost:3000/api/health"

