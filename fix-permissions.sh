#!/bin/bash

# Fix permissions for Tool Thinker project
echo "Fixing permissions..."

# Remove extended attributes that might block access
xattr -rc node_modules 2>/dev/null || echo "Note: xattr command not available"

# Clear Next.js cache
rm -rf .next

# Fix file permissions
chmod -R u+r node_modules 2>/dev/null || echo "Some files couldn't be modified (this is normal)"

echo "Done! Now try: npm run dev"



