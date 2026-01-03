#!/bin/bash

# Complete Hostinger Deployment Script
# Run this on your Hostinger VPS after SSH'ing in

set -e  # Exit on error

echo "🚀 Tool Thinker - Hostinger Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}⚠️  Please run as root${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}Step 2: Installing Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
else
    echo -e "${YELLOW}✅ Node.js already installed: $(node --version)${NC}"
fi

echo -e "${GREEN}Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed: $(pm2 --version)${NC}"
else
    echo -e "${YELLOW}✅ PM2 already installed: $(pm2 --version)${NC}"
fi

echo -e "${GREEN}Step 4: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
    echo -e "${GREEN}✅ Git installed${NC}"
else
    echo -e "${YELLOW}✅ Git already installed${NC}"
fi

echo -e "${GREEN}Step 5: Setting up app directory...${NC}"
APP_DIR="/var/www/tool-thinker"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Check if directory is empty or has files
if [ "$(ls -A $APP_DIR)" ]; then
    echo -e "${YELLOW}⚠️  Directory not empty. Do you want to:${NC}"
    echo "   1) Continue with existing files"
    echo "   2) Remove and clone fresh from Git"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" == "2" ]; then
        echo "Removing existing files..."
        rm -rf "$APP_DIR"/*
        echo -e "${GREEN}Step 6: Cloning repository...${NC}"
        git clone https://github.com/mjohnson2000/Tool-Thinker-App-2026.git .
    else
        echo -e "${YELLOW}Using existing files...${NC}"
    fi
else
    echo -e "${GREEN}Step 6: Cloning repository...${NC}"
    git clone https://github.com/mjohnson2000/Tool-Thinker-App-2026.git .
fi

echo -e "${GREEN}Step 7: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cat > .env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_agg_FhijhDhOMGwGP_w-6A_Vty1Qaq-
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
PORT=3000
ENVEOF
    echo -e "${YELLOW}⚠️  .env file created. Please edit it with your actual keys:${NC}"
    echo "   nano $APP_DIR/.env"
    read -p "Press Enter after editing .env file (or Ctrl+C to exit and edit later)..."
else
    echo -e "${YELLOW}✅ .env file already exists${NC}"
fi

echo -e "${GREEN}Step 8: Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Step 9: Building the app...${NC}"
npm run build

echo -e "${GREEN}Step 10: Setting up PM2...${NC}"
# Stop existing process if running
pm2 stop tool-thinker 2>/dev/null || true
pm2 delete tool-thinker 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo -e "${GREEN}Step 11: Setting up auto-start on reboot...${NC}"
echo ""
echo -e "${YELLOW}PM2 will show you a command to run. Please copy and run it.${NC}"
echo ""
pm2 startup

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 App Status:"
pm2 status
echo ""
echo "📝 Useful Commands:"
echo "   View logs:    pm2 logs tool-thinker"
echo "   Monitor:      pm2 monit"
echo "   Restart:      pm2 restart tool-thinker"
echo "   Stop:         pm2 stop tool-thinker"
echo ""
echo "🔗 Test your app:"
echo "   Health check: curl http://localhost:3000/api/health"
echo "   Local access: http://localhost:3000"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "   1. Edit .env file with your OpenAI API key"
echo "   2. Run the 'pm2 startup' command shown above"
echo "   3. Set up Nginx reverse proxy (optional but recommended)"
echo ""

