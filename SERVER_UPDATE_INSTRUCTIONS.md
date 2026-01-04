# Server Update Instructions

## Quick Update Commands

SSH into your server and run these commands:

```bash
# Navigate to project directory
cd ~/tool-thinker

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies (if package.json changed)
npm install

# Build the application
npm run build

# Restart PM2 to apply changes
pm2 restart tool-thinker

# Check status
pm2 status

# View logs if needed
pm2 logs tool-thinker --lines 50
```

## What Was Updated

- ✅ Replaced all emoji icons with professional Lucide React SVG icons
- ✅ Enhanced front page with stats section and improved visuals
- ✅ Added custom hero background image
- ✅ Improved card designs and visual hierarchy
- ✅ Updated all tool page hero sections with professional icons
- ✅ Enhanced "What We Offer" and "Why Tool Thinker" sections

## Files Changed

- `app/page.tsx` - Front page enhancements
- `app/tools/page.tsx` - Icon system and visual improvements
- `app/tools/business-plan-generator/page.tsx` - Icon update
- `app/tools/framework-navigator/page.tsx` - Icon update
- `app/tools/valuation-calculator/page.tsx` - Icon update
- `app/tools/equity-dilution-calculator/page.tsx` - Icon update
- `public/Startup Tools Pic.jpg` - New hero background image

## Troubleshooting

If you encounter issues:

1. **Build fails**: Check Node.js version (should be 18+)
2. **PM2 not restarting**: Try `pm2 delete tool-thinker` then `pm2 start ecosystem.config.js`
3. **Icons not showing**: Clear browser cache
4. **Image not loading**: Check that `public/Startup Tools Pic.jpg` exists on server

