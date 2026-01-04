#!/bin/bash

# Fix Mobile Navigation Menu on Server
# This script updates the Navigation component to fix mobile menu issues

echo "📱 Fixing mobile navigation menu on server..."

cd ~/tool-thinker || exit

# Backup the file
echo "💾 Backing up Navigation.tsx..."
cp components/Navigation.tsx components/Navigation.tsx.backup.$(date +%Y%m%d_%H%M%S)

# Update the import to include useEffect
echo "📝 Updating imports..."
sed -i 's/import { useState } from "react"/import { useState, useEffect } from "react"/' components/Navigation.tsx

# Add useEffect to close menu on route change (after pathname declaration)
echo "📝 Adding useEffect to close menu on route change..."
sed -i '/const pathname = usePathname()/a\  \n  // Close menu when route changes\n  useEffect(() => {\n    setIsMenuOpen(false)\n  }, [pathname])' components/Navigation.tsx

# Add onClick handlers to close menu for all mobile links
echo "📝 Adding onClick handlers to mobile menu links..."

# Home link
sed -i 's|<Link \n              href="/" \n              className={`block px-4 py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)}|' components/Navigation.tsx

# Tools main link
sed -i 's|<Link \n                href="/tools"\n                className={`block font-semibold px-4 py-2 rounded-md mb-2|& onClick={() => setIsMenuOpen(false)}|' components/Navigation.tsx

# All Tools submenu links
sed -i 's|href="/tools" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/tools/frameworks" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/tools/framework-navigator" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/tools/business-model-generator" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/tools/start-smart-os" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/tools/templates" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/consultation" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx

# Blogs and About links
sed -i 's|href="/blogs" \n              className={`block px-4 py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)}|' components/Navigation.tsx
sed -i 's|href="/about" \n              className={`block px-4 py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)}|' components/Navigation.tsx

# More submenu links
sed -i 's|href="/podcasts" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/books" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx
sed -i 's|href="/contact" className={`block py-2 hover:bg-gray-100|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx

# Alpha Hustler external link
sed -i 's|href="https://alphahustler.tech/" target="_blank" rel="noopener noreferrer" className="block py-2 text-gray-700 hover:bg-gray-100">|& onClick={() => setIsMenuOpen(false)} |' components/Navigation.tsx

# Update button with aria attributes
sed -i 's|<button\n            className="md:hidden text-gray-700"|& type="button" aria-label="Toggle menu" aria-expanded={isMenuOpen}|' components/Navigation.tsx

# Add border-top to mobile menu
sed -i 's|className="md:hidden py-4 space-y-2"|& border-t border-gray-200 bg-white|' components/Navigation.tsx

echo ""
echo "✅ Mobile navigation fixes applied!"
echo ""
echo "🔨 Rebuilding app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    echo ""
    echo "✅ Mobile navigation menu should now work on phones!"
else
    echo "❌ Build failed. Restoring backup..."
    cp components/Navigation.tsx.backup.* components/Navigation.tsx 2>/dev/null
    exit 1
fi

