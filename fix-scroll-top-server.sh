#!/bin/bash

# Fix Scroll-to-Top on Navigation for Server
# This adds scroll-to-top behavior when clicking navigation links

echo "📱 Fixing scroll-to-top on navigation..."

cd ~/tool-thinker || exit

# Backup
cp components/Navigation.tsx components/Navigation.tsx.backup.$(date +%Y%m%d_%H%M%S)

# Add scroll-to-top to useEffect
echo "📝 Adding scroll-to-top to useEffect..."
sed -i 's|setIsMenuOpen(false)|setIsMenuOpen(false)\n    // Scroll to top on route change\n    window.scrollTo({ top: 0, behavior: '\''instant'\'' })|' components/Navigation.tsx

# Add handleLinkClick function after useEffect
echo "📝 Adding handleLinkClick function..."
sed -i '/}, \[pathname\])/a\
  \
  // Helper function to handle link clicks\
  const handleLinkClick = () => {\
    setIsMenuOpen(false)\
    // Scroll to top immediately\
    window.scrollTo({ top: 0, behavior: '\''instant'\'' })\
  }' components/Navigation.tsx

# Replace onClick handlers in mobile menu
echo "📝 Updating mobile menu onClick handlers..."
sed -i 's|onClick={() => setIsMenuOpen(false)}|onClick={handleLinkClick}|g' components/Navigation.tsx

# Add scroll-to-top to desktop links
echo "📝 Adding scroll-to-top to desktop links..."
sed -i 's|href="/" \n              className={`\${isActive|href="/" \n              onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })}\n              className={`\${isActive|' components/Navigation.tsx
sed -i 's|href="/blogs" \n              className={`\${isActive|href="/blogs" \n              onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })}\n              className={`\${isActive|' components/Navigation.tsx
sed -i 's|href="/about" \n              className={`\${isActive|href="/about" \n              onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })}\n              className={`\${isActive|' components/Navigation.tsx

# Add scroll-to-top to desktop dropdown links
sed -i 's|href="/tools" className={`block px-4 py-2 text-sm|href="/tools" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/tools/frameworks" className={`block px-4 py-2 text-sm|href="/tools/frameworks" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/tools/framework-navigator" className={`block px-4 py-2 text-sm|href="/tools/framework-navigator" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/tools/business-model-generator" className={`block px-4 py-2 text-sm|href="/tools/business-model-generator" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/tools/start-smart-os" className={`block px-4 py-2 text-sm|href="/tools/start-smart-os" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/tools/templates" className={`block px-4 py-2 text-sm|href="/tools/templates" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/consultation" className={`block px-4 py-2 text-sm|href="/consultation" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/podcasts" className={`block px-4 py-2 text-sm|href="/podcasts" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/books" className={`block px-4 py-2 text-sm|href="/books" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx
sed -i 's|href="/contact" className={`block px-4 py-2 text-sm|href="/contact" onClick={() => window.scrollTo({ top: 0, behavior: '\''instant'\'' })} className={`block px-4 py-2 text-sm|g' components/Navigation.tsx

echo ""
echo "✅ Scroll-to-top fixes applied!"
echo ""
echo "🔨 Rebuilding app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    echo ""
    echo "✅ Navigation now scrolls to top on link click!"
else
    echo "❌ Build failed. Restoring backup..."
    cp components/Navigation.tsx.backup.* components/Navigation.tsx 2>/dev/null
    exit 1
fi

