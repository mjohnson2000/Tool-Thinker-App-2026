#!/bin/bash

# Fix Server Action Error in Next.js
# This error occurs when cached requests reference old Server Action IDs after a rebuild
# Solution: Clear Next.js cache and rebuild

echo "🔧 Fixing Server Action Error..."

# Navigate to project directory
cd "$(dirname "$0")" || exit

# Stop PM2 process
echo "🛑 Stopping PM2 process..."
pm2 stop tool-thinker 2>/dev/null || true

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Clear node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
    echo "🧹 Clearing node_modules cache..."
    rm -rf node_modules/.cache
fi

# Rebuild the app
echo "🔨 Rebuilding the app..."
npm run build

# Restart PM2
echo "▶️  Restarting PM2 process..."
pm2 restart tool-thinker || pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo "✅ Server Action error should be fixed!"
echo ""
echo "📊 App status:"
pm2 status

echo ""
echo "📝 Check logs if issues persist:"
echo "  pm2 logs tool-thinker --lines 50"

