#!/bin/bash
# Fix Navigation.tsx on server - restores and applies correct fixes

cd ~/tool-thinker || exit

echo "🔧 Fixing Navigation.tsx..."

# Restore from git if possible, or use backup
if [ -f components/Navigation.tsx.backup ]; then
    echo "📦 Restoring from backup..."
    cp components/Navigation.tsx.backup components/Navigation.tsx
elif git diff components/Navigation.tsx > /dev/null 2>&1; then
    echo "📦 Restoring from git..."
    git checkout components/Navigation.tsx
fi

# Now apply the correct fix using a more careful Python script
cat > /tmp/fix_nav_safe.py << 'PYEOF'
import re
import sys

try:
    with open('components/Navigation.tsx', 'r') as f:
        lines = f.readlines()
    
    # Find the line with pathname
    pathname_idx = None
    for i, line in enumerate(lines):
        if 'const pathname = usePathname()' in line:
            pathname_idx = i
            break
    
    if pathname_idx is None:
        print("❌ Could not find pathname line")
        sys.exit(1)
    
    # Check if already fixed
    content = ''.join(lines)
    if 'handleLinkClick' in content and 'useEffect' in content.split('\n')[0:10]:
        print("✅ Navigation already fixed")
        sys.exit(0)
    
    # Update import
    for i, line in enumerate(lines):
        if 'import { useState } from "react"' in line:
            lines[i] = 'import { useState, useEffect } from "react"\n'
            break
    
    # Insert useEffect and handleLinkClick after pathname line
    insert_lines = [
        '  \n',
        '  // Close menu when route changes and scroll to top\n',
        '  useEffect(() => {\n',
        '    setIsMenuOpen(false)\n',
        '    // Scroll to top on route change\n',
        '    window.scrollTo({ top: 0, behavior: \'instant\' })\n',
        '  }, [pathname])\n',
        '  \n',
        '  // Helper function to handle link clicks\n',
        '  const handleLinkClick = () => {\n',
        '    setIsMenuOpen(false)\n',
        '    // Scroll to top immediately\n',
        '    window.scrollTo({ top: 0, behavior: \'instant\' })\n',
        '  }\n',
    ]
    
    # Insert after pathname line
    lines[pathname_idx+1:pathname_idx+1] = insert_lines
    
    # Replace mobile menu onClick
    content = ''.join(lines)
    content = content.replace(
        'onClick={() => setIsMenuOpen(false)}',
        'onClick={handleLinkClick}'
    )
    
    # Add scroll-to-top to desktop Home link (careful regex)
    content = re.sub(
        r'(<Link\s+href="/"\s+)(className=)',
        r'\1onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              \2',
        content
    )
    
    # Add scroll-to-top to desktop Blogs link
    content = re.sub(
        r'(<Link\s+href="/blogs"\s+)(className=)',
        r'\1onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              \2',
        content
    )
    
    # Add scroll-to-top to desktop About link
    content = re.sub(
        r'(<Link\s+href="/about"\s+)(className=)',
        r'\1onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\n              \2',
        content
    )
    
    # Add scroll-to-top to dropdown links (more careful)
    dropdown_links = [
        '/tools', '/tools/frameworks', '/tools/framework-navigator',
        '/tools/business-model-generator', '/tools/start-smart-os',
        '/tools/templates', '/consultation', '/podcasts', '/books', '/contact'
    ]
    
    for href in dropdown_links:
        # Pattern: <Link href="/path" className= (without onClick already)
        pattern = f'(<Link href="{re.escape(href)}")(\\s+className=)'
        if f'href="{href}" onClick' not in content:
            replacement = r'\1 onClick={() => window.scrollTo({ top: 0, behavior: \'instant\' })}\2'
            content = re.sub(pattern, replacement, content)
    
    # Write back
    with open('components/Navigation.tsx', 'w') as f:
        f.write(content)
    
    print("✅ Navigation fixed successfully")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
PYEOF

python3 /tmp/fix_nav_safe.py

if [ $? -ne 0 ]; then
    echo "❌ Python fix failed, trying manual restore..."
    # Try to restore from git
    git checkout components/Navigation.tsx 2>/dev/null || {
        echo "❌ Could not restore file. Please restore manually from git or backup."
        exit 1
    }
fi

echo "✅ Navigation.tsx fixed"

