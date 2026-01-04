# Manual Server Update Instructions

## Quick Update Commands

Run these commands on your server via SSH:

```bash
cd ~/tool-thinker
pm2 stop tool-thinker
git pull origin main
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

## Step-by-Step Instructions

### 1. Connect to Your Server
```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### 2. Navigate to Project Directory
```bash
cd ~/tool-thinker
```

### 3. Stop the Application
```bash
pm2 stop tool-thinker
```

### 4. Pull Latest Changes
```bash
git pull origin main
```

If you get an error about local changes, you can either:
- Stash them: `git stash` then `git pull origin main`
- Discard them: `git restore .` then `git pull origin main`

### 5. Install Dependencies (if needed)
```bash
npm install
```

### 6. Build the Application
```bash
npm run build
```

### 7. Start the Application
```bash
pm2 start ecosystem.config.js
```

### 8. Save PM2 Configuration
```bash
pm2 save
```

### 9. Check Status
```bash
pm2 status
pm2 logs tool-thinker --lines 50
```

## Troubleshooting

### If Build Fails
- Check Node.js version: `node --version` (should be 18+)
- Clear Next.js cache: `rm -rf .next` then rebuild
- Check for TypeScript errors: `npm run build` will show them

### If PM2 Won't Start
- Check if port 3000 is in use: `lsof -i :3000`
- Check PM2 logs: `pm2 logs tool-thinker`
- Restart PM2: `pm2 restart tool-thinker`

### If Git Pull Fails
- Check git status: `git status`
- If there are conflicts, resolve them or stash changes
- Make sure you're on main branch: `git checkout main`

## Verification

After updating, verify the changes:
1. Check the website loads: `curl http://localhost:3000` or visit your domain
2. Check PM2 status shows "online": `pm2 status`
3. Check logs for errors: `pm2 logs tool-thinker --lines 20`

## What Changed

This update includes:
- ✅ ShareButton component added to all tool pages
- ✅ Share functionality in hero sections (top right)
- ✅ Share functionality in results sections
- ✅ Share functionality on tools listing page (hover to see)
- ✅ Fixed stopPropagation to prevent navigation when clicking share

