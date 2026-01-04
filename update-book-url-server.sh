#!/bin/bash

# Update Book Purchase URL on Server
# This script updates the Amazon book link on the server

echo "📚 Updating book purchase URL on server..."

cd ~/tool-thinker || exit

# Backup files
echo "💾 Backing up files..."
cp app/page.tsx app/page.tsx.backup.$(date +%Y%m%d_%H%M%S)
cp app/books/page.tsx app/books/page.tsx.backup.$(date +%Y%m%d_%H%M%S)

# Update app/page.tsx
echo "📝 Updating app/page.tsx..."
sed -i 's|https://www.amazon.com/dp/YOUR_BOOK_ISBN|https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477|g' app/page.tsx

# Update app/books/page.tsx
echo "📝 Updating app/books/page.tsx..."
sed -i 's|https://www.amazon.com/dp/YOUR_BOOK_ISBN|https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477|g' app/books/page.tsx

# Verify changes
echo ""
echo "✅ Changes made. Verifying..."
if grep -q "1300734477" app/page.tsx && grep -q "1300734477" app/books/page.tsx; then
    echo "✅ Book URL updated successfully in both files!"
else
    echo "❌ Update may have failed. Check files manually."
    exit 1
fi

# Rebuild the app
echo ""
echo "🔨 Rebuilding the app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Restart PM2
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    
    echo ""
    echo "✅ Book purchase URL updated and app restarted!"
    echo ""
    echo "🧪 Test it:"
    echo "  Visit: https://toolthinker.com"
    echo "  Click 'PURCHASE HERE!' button - should go to Amazon"
else
    echo "❌ Build failed. Check errors above."
    echo "Restoring backups..."
    cp app/page.tsx.backup.* app/page.tsx 2>/dev/null
    cp app/books/page.tsx.backup.* app/books/page.tsx 2>/dev/null
    exit 1
fi

