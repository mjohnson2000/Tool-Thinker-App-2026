#!/bin/bash

# Update Server Script
# This script pulls the latest changes from GitHub and redeploys the application

set -e  # Exit on error

echo "🚀 Starting server update process..."

# Navigate to project directory (adjust path if needed)
PROJECT_DIR="/home/toolthinker/tool-thinker-app"
cd "$PROJECT_DIR" || { echo "❌ Error: Could not navigate to project directory"; exit 1; }

echo "📂 Current directory: $(pwd)"

# Check if git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Fetch latest changes
echo "📥 Fetching latest changes from GitHub..."
git fetch origin

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $CURRENT_BRANCH"

# Pull latest changes
echo "⬇️  Pulling latest changes..."
git pull origin "$CURRENT_BRANCH" || { echo "❌ Error: Failed to pull changes"; exit 1; }

# Check if package.json changed (might need to install dependencies)
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "📦 package.json changed, installing dependencies..."
    npm install
fi

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build || { echo "❌ Error: Build failed"; exit 1; }

# Restart PM2
echo "🔄 Restarting PM2 application..."
pm2 restart tool-thinker || { echo "❌ Error: Failed to restart PM2"; exit 1; }

# Show PM2 status
echo "📊 PM2 Status:"
pm2 status

echo "✅ Server update completed successfully!"
echo "🌐 Your application should now be running with the latest changes."


