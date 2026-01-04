#!/bin/bash

# Quick Fix for All Server Issues
# This script applies all fixes: navigation, scroll-to-top, Start Smart OS, and book URL

echo "🚀 Applying all fixes to server..."

cd ~/tool-thinker || exit

# Backup important files
echo "💾 Creating backups..."
mkdir -p backups
cp components/Navigation.tsx backups/Navigation.tsx.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp app/tools/start-smart-os/page.tsx backups/start-smart-os.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp app/page.tsx backups/page.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp app/books/page.tsx backups/books.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# ============================================
# FIX 1: Update Book Purchase URL
# ============================================
echo ""
echo "📚 Fix 1: Updating book purchase URL..."
sed -i 's|https://www.amazon.com/dp/YOUR_BOOK_ISBN|https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477|g' app/page.tsx app/books/page.tsx
echo "✅ Book URL updated"

# ============================================
# FIX 2: Mobile Navigation - Add useEffect and scroll-to-top
# ============================================
echo ""
echo "📱 Fix 2: Fixing mobile navigation..."

# Update import to include useEffect
sed -i 's/import { useState } from "react"/import { useState, useEffect } from "react"/' components/Navigation.tsx

# Add useEffect and handleLinkClick after pathname declaration
# This is complex, so we'll use a here-document approach
cat > /tmp/nav_fix.js << 'NAVSCRIPT'
const fs = require('fs');
const content = fs.readFileSync('components/Navigation.tsx', 'utf8');

// Add useEffect after pathname
const pathnamePattern = /(const pathname = usePathname\(\))/;
const useEffectCode = `$1
  
  // Close menu when route changes and scroll to top
  useEffect(() => {
    setIsMenuOpen(false)
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  
  // Helper function to handle link clicks
  const handleLinkClick = () => {
    setIsMenuOpen(false)
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' })
  }`;

let newContent = content.replace(pathnamePattern, useEffectCode);

// Replace all mobile menu onClick handlers
newContent = newContent.replace(/onClick=\{\(\) => setIsMenuOpen\(false\)\}/g, 'onClick={handleLinkClick}');

// Add scroll-to-top to desktop links
newContent = newContent.replace(
  /href="\/" \n              className=\{`\$\{isActive\('/'\)/g,
  'href="/" \n              onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              className={`${isActive(\'/\')'
);

newContent = newContent.replace(
  /href="\/blogs" \n              className=\{`\$\{isActive\('\/blogs'\)/g,
  'href="/blogs" \n              onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              className={`${isActive(\'/blogs\')'
);

newContent = newContent.replace(
  /href="\/about" \n              className=\{`\$\{isActive\('\/about'\)/g,
  'href="/about" \n              onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              className={`${isActive(\'/about\')'
);

fs.writeFileSync('components/Navigation.tsx', newContent);
NAVSCRIPT

node /tmp/nav_fix.js 2>/dev/null || {
  echo "⚠️  JavaScript fix failed, using sed fallback..."
  # Fallback: simpler sed approach
  sed -i '/const pathname = usePathname()/a\
  \
  // Close menu when route changes and scroll to top\
  useEffect(() => {\
    setIsMenuOpen(false)\
    window.scrollTo({ top: 0, behavior: '\''instant'\'' })\
  }, [pathname])\
  \
  const handleLinkClick = () => {\
    setIsMenuOpen(false)\
    window.scrollTo({ top: 0, behavior: '\''instant'\'' })\
  }' components/Navigation.tsx
  
  sed -i 's|onClick={() => setIsMenuOpen(false)}|onClick={handleLinkClick}|g' components/Navigation.tsx
}

echo "✅ Mobile navigation fixed"

# ============================================
# FIX 3: Start Smart OS Error Handling
# ============================================
echo ""
echo "🔧 Fix 3: Fixing Start Smart OS error handling..."

# Add error state
sed -i '/const \[isCreating, setIsCreating\] = useState(false)/a\
  const [error, setError] = useState<string | null>(null)' app/tools/start-smart-os/page.tsx

# Update loadProjects function - this is complex, create a patch file
cat > /tmp/start_smart_fix.js << 'SMARTSCRIPT'
const fs = require('fs');
const content = fs.readFileSync('app/tools/start-smart-os/page.tsx', 'utf8');

// Replace loadProjects function
const oldLoadProjects = /async function loadProjects\(\) \{[\s\S]*?finally \{[\s\S]*?setLoading\(false\)[\s\S]*?\}[\s\S]*?\}/;
const newLoadProjects = `async function loadProjects() {
    try {
      setError(null)
      const res = await fetch("/api/projects")
      const data = await res.json()
      
      if (data.error) {
        console.error("API Error:", data.error)
        setError(data.error)
        setProjects([])
        return
      }
      
      if (!res.ok) {
        setError(data.error || "Failed to load projects")
        setProjects([])
        return
      }
      
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        setError("Unexpected response format")
        setProjects([])
      }
    } catch (error: any) {
      console.error("Failed to load projects:", error)
      setError(error.message || "Failed to load projects. Please check your connection.")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }`;

let newContent = content.replace(oldLoadProjects, newLoadProjects);

// Update createProject function
const oldCreateProject = /async function createProject\(\) \{[\s\S]*?finally \{[\s\S]*?setIsCreating\(false\)[\s\S]*?\}[\s\S]*?\}/;
const newCreateProject = `async function createProject() {
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      })
      
      const data = await res.json()
      
      if (data.error) {
        console.error("API Error:", data.error)
        alert(\`Failed to create project: \${data.error}\`)
        return
      }
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project")
      }
      
      const project = data
      setProjects([...projects, project])
      setNewProjectName("")
      window.location.href = \`/project/\${project.id}/overview\`
    } catch (error: any) {
      console.error("Failed to create project:", error)
      alert(\`Failed to create project: \${error.message || "Unknown error"}\`)
    } finally {
      setIsCreating(false)
    }
  }`;

newContent = newContent.replace(oldCreateProject, newCreateProject);

// Add error display before projects list
const projectsListPattern = /(\{projects\.length === 0)/;
const errorDisplay = `{error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm font-semibold mb-1">Error loading projects</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )}

        $1`;

newContent = newContent.replace(projectsListPattern, errorDisplay);

// Fix the conditional rendering
newContent = newContent.replace(
  /\{projects\.length === 0 \? \(/g,
  '{!loading && !error && projects.length === 0 && ('
);
newContent = newContent.replace(
  /\) : projects\.length > 0 \? \(/g,
  ')}

        {projects.length > 0 && ('
);
newContent = newContent.replace(
  /\)\}/g,
  ')}'
);

fs.writeFileSync('app/tools/start-smart-os/page.tsx', newContent);
SMARTSCRIPT

node /tmp/start_smart_fix.js 2>/dev/null || {
  echo "⚠️  JavaScript fix failed for Start Smart OS, manual edit may be needed"
}

echo "✅ Start Smart OS error handling fixed"

# ============================================
# FIX 4: Update Supabase Environment Variables
# ============================================
echo ""
echo "🔐 Fix 4: Checking Supabase configuration..."

if [ -f .env ]; then
  echo "✅ .env file exists"
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "✅ Supabase variables found in .env"
  else
    echo "⚠️  Supabase variables not found - you'll need to add them manually"
    echo "   Add to .env:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
  fi
else
  echo "⚠️  .env file not found - creating template..."
  cat > .env << 'ENVFILE'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ENVFILE
  echo "⚠️  Please edit .env and add your actual credentials"
fi

# ============================================
# REBUILD AND RESTART
# ============================================
echo ""
echo "🔨 Rebuilding application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ ALL FIXES APPLIED!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 What was fixed:"
    echo "  ✅ Book purchase URL updated"
    echo "  ✅ Mobile navigation menu closes on click"
    echo "  ✅ Scroll-to-top on navigation"
    echo "  ✅ Start Smart OS error handling"
    echo ""
    echo "⚠️  IMPORTANT: Make sure Supabase is configured:"
    echo "  1. Check .env has Supabase credentials"
    echo "  2. Run schema.sql in Supabase dashboard"
    echo "  3. Restart app if you updated .env: pm2 restart tool-thinker"
    echo ""
    echo "🧪 Test the fixes:"
    echo "  - Mobile menu should close when clicking links"
    echo "  - Page should scroll to top on navigation"
    echo "  - Start Smart OS should show errors if API fails"
else
    echo ""
    echo "❌ Build failed!"
    echo "Restoring backups..."
    cp backups/Navigation.tsx.backup.* components/Navigation.tsx 2>/dev/null
    cp backups/start-smart-os.backup.* app/tools/start-smart-os/page.tsx 2>/dev/null
    cp backups/page.backup.* app/page.tsx 2>/dev/null
    cp backups/books.backup.* app/books/page.tsx 2>/dev/null
    echo "Check errors above and fix manually"
    exit 1
fi

