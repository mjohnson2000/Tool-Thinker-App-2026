#!/bin/bash
# Script to fix the server build issue
# Run this on the server: ssh root@72.62.170.11

echo "🔧 Fixing server build..."

cd /root/tool-thinker || exit 1

echo "📥 Pulling latest code..."
git pull origin main

echo "🧹 Clearing .next cache..."
rm -rf .next

echo "📦 Reinstalling dependencies..."
npm install

echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    pm2 logs tool-thinker --lines 20 --nostream
else
    echo "❌ Build failed. Check the error above."
    exit 1
fi

