# Manual Server Update Instructions

This guide will help you update your server with the latest changes from GitHub.

## Quick Update (Using Script)

1. **SSH into your server:**
   ```bash
   ssh your-username@your-server-ip
   ```

2. **Navigate to your project directory:**
   ```bash
   cd /path/to/your/project
   # Example: cd /home/toolthinker/tool-thinker-app
   ```

3. **Run the update script:**
   ```bash
   bash scripts/update-server.sh
   ```

## Manual Update (Step by Step)

If you prefer to update manually, follow these steps:

### 1. SSH into your server
```bash
ssh your-username@your-server-ip
```

### 2. Navigate to project directory
```bash
cd /path/to/your/project
```

### 3. Pull latest changes from GitHub
```bash
git fetch origin
git pull origin main
```

### 4. Install dependencies (if package.json changed)
```bash
npm install
```

### 5. Build the Next.js application
```bash
npm run build
```

### 6. Restart PM2
```bash
pm2 restart tool-thinker
```

### 7. Check PM2 status
```bash
pm2 status
pm2 logs tool-thinker --lines 50
```

## Verify the Update

1. **Check if the app is running:**
   ```bash
   pm2 status
   ```

2. **Check application logs:**
   ```bash
   pm2 logs tool-thinker --lines 100
   ```

3. **Visit your website** and verify:
   - New calculator tools are visible
   - Chatbot (Marcus) is working
   - Legal pages are accessible
   - Startup Plan Generator (renamed from Start Smart OS) works

## Troubleshooting

### If build fails:
- Check Node.js version: `node --version` (should be 18+)
- Check npm version: `npm --version`
- Try clearing Next.js cache: `rm -rf .next` then rebuild

### If PM2 restart fails:
- Check PM2 process: `pm2 list`
- Check PM2 logs: `pm2 logs tool-thinker`
- Try stopping and starting: `pm2 stop tool-thinker && pm2 start tool-thinker`

### If application doesn't load:
- Check Nginx status: `sudo systemctl status nginx`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify environment variables are set: `cat .env | grep OPENAI_API_KEY`

## What's New in This Update

- ✅ 6 new calculator tools (Valuation, Equity Dilution, Market Size, Pricing Strategy, Runway, Team Cost)
- ✅ Marcus chatbot with markdown rendering
- ✅ Legal pages (Terms, Privacy, Disclaimer)
- ✅ Startup Plan Generator (renamed from Start Smart OS)
- ✅ Improved consultation API
- ✅ Markdown renderer for professional formatting

## Notes

- The update script automatically handles git pull, build, and PM2 restart
- Make sure your `.env` file has the correct `OPENAI_API_KEY` set
- The build process may take a few minutes
- PM2 will automatically restart the application after the build completes

