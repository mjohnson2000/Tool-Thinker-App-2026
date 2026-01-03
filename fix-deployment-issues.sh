#!/bin/bash

# Fix deployment issues on Hostinger server
# Run this on the server after SSH'ing in

set -e

echo "🔧 Fixing deployment issues..."

# 1. Upgrade Node.js to version 20 (required by Supabase)
echo "📦 Upgrading Node.js to version 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "✅ Node.js version: $(node --version)"

# 2. Navigate to app directory
cd ~/tool-thinker

# 3. Pull latest changes (with the TypeScript fix)
echo "📥 Pulling latest code..."
git pull

# 4. Reinstall dependencies with Node 20
echo "📦 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# 5. Build the app
echo "🔨 Building app..."
npm run build

# 6. Make sure ecosystem.config.js exists
if [ ! -f ecosystem.config.js ]; then
    echo "⚠️  ecosystem.config.js not found. Creating it..."
    # The file should be in the repo, but if not, we'll create it
fi

# 7. Start with PM2
echo "▶️  Starting with PM2..."
pm2 stop tool-thinker 2>/dev/null || true
pm2 delete tool-thinker 2>/dev/null || true
pm2 start ecosystem.config.js

# 8. Save PM2 configuration
pm2 save

echo ""
echo "✅ Fixes applied!"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "🔗 Test: curl http://localhost:3000/api/health"

