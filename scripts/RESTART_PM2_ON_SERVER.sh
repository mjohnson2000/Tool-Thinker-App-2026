#!/bin/bash

# Restart PM2 on Server
# Run this on the server: bash RESTART_PM2_ON_SERVER.sh

cd /root/tool-thinker

echo "🔄 Restarting PM2 with fresh build..."

# Restart PM2 to pick up the new build
pm2 restart tool-thinker

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs (last 10 lines):"
pm2 logs tool-thinker --lines 10 --nostream

echo ""
echo "✅ PM2 restarted. Check if the app is running properly now."

