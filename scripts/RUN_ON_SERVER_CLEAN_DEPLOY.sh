#!/bin/bash

# Clean Server Deployment Script
# Run this script directly on the server: bash RUN_ON_SERVER_CLEAN_DEPLOY.sh

set -e  # Exit on error

cd /root/tool-thinker || exit 1

echo "🧹 Starting clean server deployment..."
echo "📂 Current directory: $(pwd)"
echo ""

# Step 1: Stop PM2 process
echo "🛑 Stopping PM2 process..."
pm2 stop tool-thinker 2>/dev/null || echo "PM2 process not running"
pm2 delete tool-thinker 2>/dev/null || echo "PM2 process not found"
echo "✅ PM2 stopped"
echo ""

# Step 2: Clean all caches and build artifacts
echo "🧹 Cleaning caches and build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf dist
rm -rf build
echo "✅ Caches cleaned"
echo ""

# Step 3: Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
git clean -fd
echo "✅ Code updated to latest version"
echo ""

# Step 4: Clean install dependencies
echo "📦 Installing dependencies (clean install)..."
rm -rf node_modules
rm -f package-lock.json
npm install
echo "✅ Dependencies installed"
echo ""

# Step 5: Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Step 6: Start PM2 with production config
echo "🚀 Starting PM2 process..."
pm2 start ecosystem.config.js

if [ $? -ne 0 ]; then
    echo "❌ PM2 start failed!"
    exit 1
fi

echo "✅ PM2 started"
echo ""

# Step 7: Save PM2 configuration
pm2 save
echo "✅ PM2 configuration saved"
echo ""

# Step 8: Check status
echo "📊 PM2 Status:"
pm2 status
echo ""

# Step 9: Show recent logs
echo "📋 Recent logs (last 20 lines):"
pm2 logs tool-thinker --lines 20 --nostream
echo ""

echo "✅ Clean deployment completed successfully!"
echo ""
echo "Test your server:"
echo "  curl http://localhost:3000/api/health"
echo "  or visit: http://72.62.170.11"

