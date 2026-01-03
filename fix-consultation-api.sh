#!/bin/bash

# Fix Consultation API Issue
# This script checks and fixes common issues with the consultation API

echo "🔍 Diagnosing Consultation API Issue..."

cd ~/tool-thinker || exit

# 1. Check if .env file exists
echo ""
echo "1️⃣ Checking environment variables..."
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
    echo "   Run: nano .env"
    exit 1
else
    echo "✅ .env file exists"
fi

# 2. Check if OPENAI_API_KEY is set
if grep -q "OPENAI_API_KEY=your_openai" .env || grep -q "OPENAI_API_KEY=$" .env || ! grep -q "OPENAI_API_KEY=" .env; then
    echo "❌ OPENAI_API_KEY is not set or is using placeholder value"
    echo ""
    echo "📝 Please set your OpenAI API key:"
    echo "   1. Get your API key from: https://platform.openai.com/api-keys"
    echo "   2. Edit .env file: nano .env"
    echo "   3. Replace 'your_openai_api_key_here' with your actual key"
    echo "   4. Save and run this script again"
    exit 1
else
    echo "✅ OPENAI_API_KEY is set in .env"
fi

# 3. Check if PM2 has the environment variables
echo ""
echo "2️⃣ Checking PM2 environment..."
if pm2 describe tool-thinker > /dev/null 2>&1; then
    echo "✅ PM2 process exists"
    
    # Check if env vars are loaded
    echo "📋 Current PM2 environment:"
    pm2 env tool-thinker | grep -E "(OPENAI|NODE_ENV)" || echo "⚠️  Environment variables not visible in PM2"
else
    echo "⚠️  PM2 process not found"
fi

# 4. Test the API endpoint directly
echo ""
echo "3️⃣ Testing API endpoint..."
sleep 2
RESPONSE=$(curl -s -X POST http://localhost:3000/api/consultation/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}' \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API endpoint is working!"
    echo "Response: $BODY"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ API endpoint returned 500 error"
    echo "Response: $BODY"
    echo ""
    echo "This usually means:"
    echo "  - OPENAI_API_KEY is invalid or missing"
    echo "  - OpenAI API is down or rate limited"
    echo "  - Network connectivity issue"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Cannot connect to API endpoint"
    echo "  - Is the app running? Check: pm2 status"
    echo "  - Is port 3000 accessible? Check: curl http://localhost:3000/api/health"
else
    echo "⚠️  API endpoint returned HTTP $HTTP_CODE"
    echo "Response: $BODY"
fi

# 5. Check PM2 logs for errors
echo ""
echo "4️⃣ Checking PM2 logs for errors..."
echo "Recent errors:"
pm2 logs tool-thinker --lines 20 --err --nostream | grep -i "error\|openai\|api" || echo "No recent errors found"

# 6. Provide fix instructions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX INSTRUCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If OPENAI_API_KEY is missing or invalid:"
echo ""
echo "1. Get your OpenAI API key:"
echo "   https://platform.openai.com/api-keys"
echo ""
echo "2. Edit .env file:"
echo "   nano .env"
echo ""
echo "3. Set OPENAI_API_KEY:"
echo "   OPENAI_API_KEY=sk-your-actual-key-here"
echo ""
echo "4. Restart the app:"
echo "   pm2 restart tool-thinker"
echo ""
echo "5. Test again:"
echo "   curl -X POST http://localhost:3000/api/consultation/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"messages\":[{\"role\":\"user\",\"content\":\"test\"}]}'"
echo ""

