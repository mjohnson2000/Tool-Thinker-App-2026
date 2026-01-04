#!/bin/bash

# Check Server Status
# Run this on the server: bash CHECK_SERVER_STATUS.sh

cd /root/tool-thinker

echo "📊 PM2 Status:"
pm2 status
echo ""

echo "📋 Latest logs (last 5 lines):"
pm2 logs tool-thinker --lines 5 --nostream
echo ""

echo "🔍 Checking if .next directory exists:"
ls -la .next/BUILD_ID 2>/dev/null && echo "✅ Build exists" || echo "❌ Build missing"
echo ""

echo "🌐 Testing server response:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/health || echo "❌ Server not responding"
echo ""

echo "✅ Status check complete"

