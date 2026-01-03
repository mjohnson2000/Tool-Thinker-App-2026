#!/bin/bash

# Quick deployment script for Hostinger
# Run this after SSH'ing into your server

set -e

echo "🚀 Tool Thinker Deployment Script"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root or with sudo"
    exit 1
fi

# Step 1: Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Step 2: Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

# Step 3: Check if app directory exists
read -p "Enter app directory path (default: /var/www/tool-thinker): " APP_DIR
APP_DIR=${APP_DIR:-/var/www/tool-thinker}

if [ ! -d "$APP_DIR" ]; then
    echo "📁 Creating app directory: $APP_DIR"
    mkdir -p "$APP_DIR"
    echo "⚠️  Please upload your app files to $APP_DIR"
    echo "   You can use: git clone, SFTP, or rsync"
    read -p "Press Enter after files are uploaded..."
fi

cd "$APP_DIR"

# Step 4: Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
PORT=3000
EOF
    echo "📝 Please edit .env file with your actual keys:"
    echo "   nano $APP_DIR/.env"
    read -p "Press Enter after editing .env file..."
fi

# Step 5: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 6: Build app
echo "🔨 Building app..."
npm run build

# Step 7: Stop existing PM2 process if running
echo "🛑 Stopping existing process (if any)..."
pm2 stop tool-thinker 2>/dev/null || true
pm2 delete tool-thinker 2>/dev/null || true

# Step 8: Start with PM2
echo "▶️  Starting app with PM2..."
pm2 start ecosystem.config.js

# Step 9: Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Step 10: Setup PM2 startup
echo "🔄 Setting up PM2 startup..."
echo ""
echo "Run this command (PM2 will show it):"
echo "   pm2 startup"
echo ""
read -p "Have you run 'pm2 startup' and the command it provided? (y/n): " STARTUP_DONE
if [ "$STARTUP_DONE" != "y" ]; then
    echo "⚠️  Please run 'pm2 startup' manually and follow instructions"
fi

# Step 11: Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 App status:"
pm2 status

echo ""
echo "📝 Useful commands:"
echo "   View logs:    pm2 logs tool-thinker"
echo "   Monitor:      pm2 monit"
echo "   Restart:      pm2 restart tool-thinker"
echo "   Health check: curl http://localhost:3000/api/health"
echo ""
echo "🌐 Your app should be running on: http://$(hostname -I | awk '{print $1}'):3000"
echo "   (or configure Nginx reverse proxy for your domain)"

