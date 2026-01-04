#!/bin/bash

# 502 Bad Gateway Diagnostic Script
# Run this on your server via SSH

echo "🔍 Diagnosing 502 Bad Gateway Error..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check PM2 status
echo "1️⃣ PM2 Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
echo ""

# Check PM2 logs
echo "2️⃣ PM2 Logs (last 50 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs tool-thinker --lines 50 --nostream 2>/dev/null || echo "⚠️  Could not retrieve logs"
echo ""

# Check if port 3000 is in use
echo "3️⃣ Port 3000 Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v lsof &> /dev/null; then
    lsof -i :3000 || echo "⚠️  Port 3000 is not in use (app may not be running)"
else
    netstat -tulpn | grep 3000 || echo "⚠️  Port 3000 is not in use (app may not be running)"
fi
echo ""

# Check Nginx status
echo "4️⃣ Nginx Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo systemctl status nginx --no-pager -l 2>/dev/null | head -20 || echo "⚠️  Could not check Nginx status"
echo ""

# Check Nginx error logs
echo "5️⃣ Nginx Error Logs (last 50 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo tail -50 /var/log/nginx/error.log 2>/dev/null || echo "⚠️  Could not read Nginx error log"
echo ""

# Check if .next directory exists
echo "6️⃣ Build Directory Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d ~/tool-thinker/.next ]; then
    echo "✅ .next directory exists"
    echo "Size and contents:"
    ls -lah ~/tool-thinker/.next | head -10
else
    echo "❌ .next directory MISSING - This is likely the problem!"
    echo "   The app needs to be built. Run: npm run build"
fi
echo ""

# Check Node.js version
echo "7️⃣ Node.js Version:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node --version || echo "⚠️  Node.js not found"
echo ""

# Check if app directory exists
echo "8️⃣ Project Directory Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d ~/tool-thinker ]; then
    echo "✅ Project directory exists"
    cd ~/tool-thinker
    echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "Last commit: $(git log -1 --oneline 2>/dev/null || echo 'unknown')"
else
    echo "❌ Project directory ~/tool-thinker not found!"
fi
echo ""

# Check environment file
echo "9️⃣ Environment File Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ~/tool-thinker/.env ]; then
    echo "✅ .env file exists"
    echo "File size: $(ls -lh ~/tool-thinker/.env | awk '{print $5}')"
else
    echo "⚠️  .env file not found (may cause issues)"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary & Recommendations:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Provide recommendations based on findings
if ! pm2 list | grep -q "tool-thinker.*online"; then
    echo "❌ PM2 process is not online"
    echo "   → Run: pm2 start ecosystem.config.js"
fi

if [ ! -d ~/tool-thinker/.next ]; then
    echo "❌ Build directory missing"
    echo "   → Run: cd ~/tool-thinker && npm run build"
fi

if ! lsof -i :3000 &>/dev/null && ! netstat -tulpn 2>/dev/null | grep -q ":3000"; then
    echo "⚠️  Nothing listening on port 3000"
    echo "   → App is not running. Check PM2 status above."
fi

echo ""
echo "💡 Quick Fix Commands:"
echo "   cd ~/tool-thinker"
echo "   pm2 stop tool-thinker"
echo "   rm -rf .next"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 status"

