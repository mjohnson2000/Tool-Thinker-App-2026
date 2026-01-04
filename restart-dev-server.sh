#!/bin/bash

# Restart Development Server Script
# This script kills any process on port 3001 and starts the dev server

cd "/Users/marcjohnson2000/Desktop/Tool Thinker - New design 2026"

echo "🛑 Stopping any existing server on port 3001..."

# Kill all processes on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 2

# Also kill any Next.js processes
pkill -f "next dev" 2>/dev/null
pkill -f "node.*next" 2>/dev/null
sleep 1

# Verify port is free
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  Port 3001 is still in use. Trying harder..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Check if port is now free
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "❌ Could not free port 3001. Please manually kill the process:"
    echo "   lsof -ti:3001 | xargs kill -9"
    exit 1
fi

echo "✅ Port 3001 is now free"
echo ""
echo "🚀 Starting development server on port 3001..."
echo ""

# Start the dev server
npm run dev

