#!/bin/bash

# Server Update Script
# Updates the server with latest code from GitHub

SERVER="root@72.62.170.11"
APP_DIR="/root/tool-thinker"  # Server app directory

echo "🚀 Starting server update..."
echo ""

# Step 1: SSH into server and pull latest code
echo "📥 Pulling latest code from GitHub..."
ssh $SERVER << 'ENDSSH'
cd /root/tool-thinker || exit 1

echo "Current directory: $(pwd)"
echo ""

# Check if git repo exists
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Please check the directory."
    exit 1
fi

# Fetch latest changes
echo "Fetching latest changes..."
git fetch origin

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

echo "✅ Code updated successfully"
echo ""

# Step 2: Install dependencies (especially new ones like zod)
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 3: Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    echo "⚠️  Server will continue running with old build"
    exit 1
fi

echo "✅ Build completed"
echo ""

# Step 4: Restart PM2
echo "🔄 Restarting PM2 process..."
pm2 restart tool-thinker

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 restart failed. Trying to start..."
    pm2 start ecosystem.config.js || pm2 start npm --name tool-thinker -- start
fi

echo "✅ PM2 restarted"
echo ""

# Step 5: Check status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs tool-thinker --lines 10 --nostream

echo ""
echo "✅ Server update complete!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Server update successful!"
    echo ""
    echo "Test your server:"
    echo "  curl http://72.62.170.11/api/health"
else
    echo ""
    echo "❌ Server update failed. Check the output above for errors."
    exit 1
fi

