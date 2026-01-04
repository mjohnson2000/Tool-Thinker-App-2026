#!/bin/bash
# Run these commands on the server via SSH

echo "🚀 Starting server update..."
echo ""

# SSH into the server and run:
ssh root@72.62.170.11 << 'EOF'
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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    echo "⚠️  Server will continue running with old build"
    exit 1
fi

echo "✅ Build completed"
echo ""

# Restart PM2
echo "🔄 Restarting PM2 process..."
pm2 restart tool-thinker

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 restart failed. Trying to start..."
    pm2 start ecosystem.config.js || pm2 start npm --name tool-thinker -- start
fi

echo "✅ PM2 restarted"
echo ""

# Check status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs tool-thinker --lines 10 --nostream

echo ""
echo "✅ Server update complete!"
EOF

echo ""
echo "🎉 Server update complete!"
echo ""
echo "Test your server:"
echo "  curl http://72.62.170.11/api/health"

