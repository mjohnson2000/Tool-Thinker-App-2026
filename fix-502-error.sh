#!/bin/bash

echo "🔍 Diagnosing 502 Bad Gateway Error..."
echo ""

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status
echo ""

# Check PM2 logs (last 50 lines)
echo "📝 Recent PM2 Logs:"
pm2 logs tool-thinker --lines 50 --nostream
echo ""

# Check if port 3000 is in use
echo "🔌 Checking port 3000:"
lsof -i :3000 || echo "Port 3000 is not in use"
echo ""

# Check Nginx status
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l | head -20
echo ""

# Check if .next directory exists
echo "📁 Checking build directory:"
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
    ls -la .next | head -5
else
    echo "❌ .next directory not found - build may be missing"
fi
echo ""

# Check environment variables
echo "🔑 Checking environment variables:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "OPENAI_API_KEY" .env; then
        echo "✅ OPENAI_API_KEY is set"
    else
        echo "⚠️  OPENAI_API_KEY not found in .env"
    fi
else
    echo "❌ .env file not found"
fi
echo ""

echo "💡 Quick Fix Commands:"
echo "  pm2 restart tool-thinker"
echo "  pm2 logs tool-thinker"
echo "  npm run build"
echo "  pm2 delete tool-thinker && pm2 start ecosystem.config.js"

