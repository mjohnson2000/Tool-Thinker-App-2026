#!/bin/bash
# Simple fix script - copy this entire file to your server

cd ~/tool-thinker || exit

echo "🔧 Applying fixes..."

# 1. Book URL
echo "📚 Updating book URL..."
sed -i 's|https://www.amazon.com/dp/YOUR_BOOK_ISBN|https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477|g' app/page.tsx 2>/dev/null || true

# 2. Navigation - create Python script to fix it properly
echo "📱 Fixing navigation..."
cat > /tmp/fix_nav.py << 'PYEOF'
import re

with open('components/Navigation.tsx', 'r') as f:
    content = f.read()

# Add useEffect import if missing
if 'useEffect' not in content.split('\n')[0:10]:
    content = content.replace(
        'import { useState } from "react"',
        'import { useState, useEffect } from "react"'
    )

# Add useEffect and handleLinkClick after pathname
if 'handleLinkClick' not in content:
    content = re.sub(
        r'(const pathname = usePathname\(\))',
        r'''\1
  
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
  }''',
        content
    )

# Replace mobile menu onClick
content = content.replace(
    'onClick={() => setIsMenuOpen(false)}',
    'onClick={handleLinkClick}'
)

# Add scroll-to-top to desktop links (Home, Blogs, About)
content = re.sub(
    r'(<Link\s+href="/"\s+)(className=)',
    r'\1onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              \2',
    content
)
content = re.sub(
    r'(<Link\s+href="/blogs"\s+)(className=)',
    r'\1onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              \2',
    content
)
content = re.sub(
    r'(<Link\s+href="/about"\s+)(className=)',
    r'\1onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              \2',
    content
)

# Add scroll-to-top to dropdown links
for href in ['/tools', '/tools/frameworks', '/tools/framework-navigator', '/tools/business-model-generator', '/tools/start-smart-os', '/tools/templates', '/consultation', '/podcasts', '/books', '/contact']:
    pattern = f'(<Link href="{re.escape(href)}")(\\s+className=)'
    replacement = r'\1 onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\2'
    content = re.sub(pattern, replacement, content)

with open('components/Navigation.tsx', 'w') as f:
    f.write(content)

print("✅ Navigation fixed")
PYEOF

python3 /tmp/fix_nav.py 2>/dev/null || {
    echo "⚠️  Python not available, trying sed method..."
    # Fallback sed method
    sed -i 's/import { useState } from "react"/import { useState, useEffect } from "react"/' components/Navigation.tsx
    sed -i '/const pathname = usePathname()/a\
  \
  useEffect(() => {\
    setIsMenuOpen(false)\
    window.scrollTo({ top: 0, behavior: '\''instant'\'' })\
  }, [pathname])\
  \
  const handleLinkClick = () => {\
    setIsMenuOpen(false)\
    window.scrollTo({ top: 0, behavior: '\''instant'\'' })\
  }' components/Navigation.tsx
    sed -i 's/onClick={() => setIsMenuOpen(false)}/onClick={handleLinkClick}/g' components/Navigation.tsx
}

echo "🔨 Rebuilding..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Restarting PM2..."
    pm2 restart tool-thinker
    echo ""
    echo "✅ All fixes applied!"
else
    echo "❌ Build failed"
    exit 1
fi
