#!/bin/bash

# Fix 502 Bad Gateway Error
# Run this on your server

set -e

echo "🔍 Diagnosing 502 Bad Gateway error..."

cd ~/tool-thinker || { echo "❌ Error: ~/tool-thinker directory not found"; exit 1; }

echo ""
echo "1️⃣ Checking PM2 status..."
pm2 status

echo ""
echo "2️⃣ Checking PM2 logs (last 30 lines)..."
pm2 logs tool-thinker --lines 30 --nostream || echo "⚠️  No logs found"

echo ""
echo "3️⃣ Checking if .next directory exists..."
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
    ls -la .next | head -5
else
    echo "❌ .next directory missing - need to build"
fi

echo ""
echo "4️⃣ Checking if port 3000 is in use..."
if command -v lsof &> /dev/null; then
    lsof -i :3000 || echo "⚠️  Port 3000 not in use (or lsof not available)"
else
    netstat -tulpn | grep 3000 || echo "⚠️  Port 3000 not in use"
fi

echo ""
echo "5️⃣ Checking Nginx status..."
sudo systemctl status nginx --no-pager -l || echo "⚠️  Could not check Nginx status"

echo ""
echo "6️⃣ Checking Nginx error logs (last 20 lines)..."
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "⚠️  Could not read Nginx error log"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Attempting to fix..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stop PM2
echo ""
echo "🛑 Stopping PM2 process..."
pm2 stop tool-thinker 2>/dev/null || true

# Check if build exists
if [ ! -d ".next" ]; then
    echo "🔨 Building application (no .next directory found)..."
    npm run build
else
    echo "🔄 Clearing cache and rebuilding..."
    rm -rf .next
    npm run build
fi

# Start PM2
echo ""
echo "▶️  Starting PM2 process..."
pm2 start ecosystem.config.js
pm2 save

# Wait a moment
sleep 3

# Check status
echo ""
echo "📊 Final status check..."
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs tool-thinker --lines 20 --nostream

echo ""
echo "✅ Fix attempt complete!"
echo ""
echo "If still getting 502 error, check:"
echo "  - PM2 logs: pm2 logs tool-thinker"
echo "  - Nginx logs: sudo tail -50 /var/log/nginx/error.log"
echo "  - Port 3000: lsof -i :3000"
echo "  - Nginx config: sudo nginx -t"
