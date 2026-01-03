#!/bin/bash

# Fix Start Smart OS Error
# This script diagnoses and fixes common issues with the Start Smart OS page

echo "🔍 Diagnosing Start Smart OS error..."

cd ~/tool-thinker || exit

# 1. Check if Supabase environment variables are set
echo ""
echo "1️⃣ Checking Supabase configuration..."
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

if grep -q "NEXT_PUBLIC_SUPABASE_URL=your_supabase" .env || ! grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env; then
    echo "⚠️  Supabase URL not configured"
    echo "   The Start Smart OS tool requires Supabase to store projects"
    echo "   Edit .env and add:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
fi

# 2. Test the API endpoint
echo ""
echo "2️⃣ Testing /api/projects endpoint..."
sleep 2
RESPONSE=$(curl -s http://localhost:3000/api/projects)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/projects)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API endpoint is responding"
    echo "Response: $RESPONSE" | head -c 200
    echo "..."
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ API endpoint returned 500 error"
    echo "Response: $RESPONSE"
    echo ""
    echo "This usually means:"
    echo "  - Supabase connection issue"
    echo "  - Database tables not created"
    echo "  - Missing environment variables"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Cannot connect to API endpoint"
    echo "  - Is the app running? Check: pm2 status"
else
    echo "⚠️  API endpoint returned HTTP $HTTP_CODE"
    echo "Response: $RESPONSE"
fi

# 3. Check PM2 logs for errors
echo ""
echo "3️⃣ Checking PM2 logs for errors..."
echo "Recent errors related to projects API:"
pm2 logs tool-thinker --lines 30 --err --nostream | grep -i "project\|supabase\|database" || echo "No recent errors found"

# 4. Check if database tables exist
echo ""
echo "4️⃣ Database setup check..."
echo "If you see Supabase errors, you may need to:"
echo "  1. Set up Supabase database"
echo "  2. Run the schema SQL (lib/supabase/schema.sql)"
echo "  3. Configure environment variables"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX INSTRUCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If the API is returning errors:"
echo ""
echo "1. Check Supabase configuration in .env:"
echo "   cat .env | grep SUPABASE"
echo ""
echo "2. Verify database tables exist:"
echo "   - Check Supabase dashboard"
echo "   - Run schema.sql if needed"
echo ""
echo "3. Test API directly:"
echo "   curl http://localhost:3000/api/projects"
echo ""
echo "4. Check PM2 logs:"
echo "   pm2 logs tool-thinker --err --lines 50"
echo ""

