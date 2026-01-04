#!/bin/bash

# Script to fix missing closing div tags in calculator pages
# Run this on the server after pulling latest code

echo "🔧 Fixing missing closing div tags in calculator pages..."

# Fix market-size-calculator
sed -i '221a\              </div>' app/tools/market-size-calculator/page.tsx

# Fix pricing-strategy-calculator  
sed -i '240a\              </div>' app/tools/pricing-strategy-calculator/page.tsx

# Fix runway-calculator
sed -i '221a\              </div>' app/tools/runway-calculator/page.tsx

# Fix team-cost-calculator
sed -i '236a\              </div>' app/tools/team-cost-calculator/page.tsx

echo "✅ Fixes applied!"
echo ""
echo "Now run: npm run build"

