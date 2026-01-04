#!/bin/bash

# Fix Local Connection Issues Script
# This script helps diagnose and fix "can't be reached" errors

set -e

echo "🔍 Diagnosing local connection issues..."
echo ""

# Get the project directory
PROJECT_DIR="/Users/marcjohnson2000/Desktop/Tool Thinker - New design 2026"
cd "$PROJECT_DIR"

# Check if port 3001 is in use (default dev port)
echo "1. Checking if port 3001 is in use..."
PORT_PID=$(lsof -ti:3001 2>/dev/null || echo "")

if [ -n "$PORT_PID" ]; then
    echo "   ⚠️  Port 3001 is already in use by process $PORT_PID"
    echo "   🔧 Attempting to kill the process..."
    kill -9 $PORT_PID 2>/dev/null || echo "   ⚠️  Could not kill process. You may need to run: kill -9 $PORT_PID"
    sleep 2
    echo "   ✅ Port 3001 should now be free"
else
    echo "   ✅ Port 3001 is free"
fi

# Check if node_modules exists
echo ""
echo "2. Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules not found. Installing dependencies..."
    npm install
else
    echo "   ✅ Dependencies installed"
fi

# Check for .env file
echo ""
echo "3. Checking environment configuration..."
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo "   ⚠️  No .env file found. Creating .env.local template..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini

# Book Purchase URL
NEXT_PUBLIC_BOOK_PURCHASE_URL=https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477

# Node Environment
NODE_ENV=development
EOF
    echo "   ✅ Created .env.local template. Please update with your actual values."
else
    echo "   ✅ Environment file exists"
fi

# Check Next.js installation
echo ""
echo "4. Verifying Next.js installation..."
if ! command -v next &> /dev/null && [ ! -f "node_modules/.bin/next" ]; then
    echo "   ⚠️  Next.js not found. Reinstalling..."
    npm install next@latest react@latest react-dom@latest
else
    echo "   ✅ Next.js is installed"
fi

# Clear Next.js cache
echo ""
echo "5. Clearing Next.js cache..."
rm -rf .next
echo "   ✅ Cache cleared"

echo ""
echo "=========================================="
echo "✅ Diagnosis complete!"
echo ""
echo "To start your development server, run:"
echo "  npm run dev"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3001"
echo ""
echo "If you still have issues:"
echo "  1. Make sure no other terminal is running 'npm run dev'"
echo "  2. Try a different port: PORT=3001 npm run dev"
echo "  3. Check your firewall settings"
echo "  4. Verify your .env.local file has correct values"
echo "=========================================="

