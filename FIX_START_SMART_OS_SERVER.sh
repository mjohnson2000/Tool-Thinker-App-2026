#!/bin/bash
# Fix Start Smart OS error on server

cd ~/tool-thinker || exit

echo "🔧 Fixing Start Smart OS error..."

# Step 1: Fix API route to always return array
echo "📝 Updating API route..."
cat > app/api/projects/route.ts << 'APIEOF'
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

// For now, using a mock user ID - replace with actual auth
const MOCK_USER_ID = "user-1"

export async function GET(req: NextRequest) {
  try {
    const projects = await db.getProjects(MOCK_USER_ID)
    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(projects) ? projects : [])
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    // Return empty array instead of error object to prevent .map() errors
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    const project = await db.createProject(MOCK_USER_ID, name)
    await db.logEvent(MOCK_USER_ID, "project_created", { projectId: project.id }, project.id)
    
    return NextResponse.json(project)
  } catch (error: any) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    )
  }
}
APIEOF

# Step 2: Check and fix Supabase environment variables
echo ""
echo "🔐 Checking Supabase configuration..."

if [ -f .env ]; then
  # Check if variables exist with correct names
  if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_URL not found, checking for alternatives..."
    
    # Check for PUBLIC_SUPABASE_URL (wrong prefix)
    if grep -q "^PUBLIC_SUPABASE_URL" .env; then
      echo "📝 Fixing PUBLIC_SUPABASE_URL to NEXT_PUBLIC_SUPABASE_URL..."
      sed -i 's/^PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/' .env
    else
      echo "⚠️  Adding NEXT_PUBLIC_SUPABASE_URL..."
      echo "" >> .env
      echo "# Supabase Configuration" >> .env
      echo "NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co" >> .env
    fi
  fi
  
  if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found, checking for alternatives..."
    
    # Check for PUBLIC_SUPABASE_ANON_KEY (wrong prefix)
    if grep -q "^PUBLIC_SUPABASE_ANON_KEY" .env; then
      echo "📝 Fixing PUBLIC_SUPABASE_ANON_KEY to NEXT_PUBLIC_SUPABASE_ANON_KEY..."
      sed -i 's/^PUBLIC_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/' .env
    else
      echo "⚠️  Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
      echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_agg_FhijhDhOMGwGP_w-6A_Vty1Qaq-" >> .env
    fi
  fi
  
  echo "✅ Supabase variables configured"
else
  echo "⚠️  .env file not found, creating it..."
  cat > .env << 'ENVEOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_agg_FhijhDhOMGwGP_w-6A_Vty1Qaq-

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini
ENVEOF
  echo "⚠️  Please update OPENAI_API_KEY in .env with your actual key"
fi

# Step 3: Rebuild
echo ""
echo "🔨 Rebuilding application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Start Smart OS Fix Applied!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Fixed:"
    echo "  ✅ API route now always returns array"
    echo "  ✅ Supabase environment variables checked"
    echo ""
    echo "⚠️  Important: Make sure database tables exist in Supabase!"
    echo "   Run the SQL from lib/supabase/schema.sql in Supabase Dashboard"
else
    echo "❌ Build failed - check errors above"
    exit 1
fi

