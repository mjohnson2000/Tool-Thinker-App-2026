# Fix 502 Bad Gateway Error

## Quick Fix Commands

Run these on your server via SSH:

```bash
cd ~/tool-thinker

# Check PM2 status
pm2 status

# Check if app is running
pm2 logs tool-thinker --lines 50

# If not running, check for errors
pm2 restart tool-thinker

# If that doesn't work, rebuild
pm2 stop tool-thinker
rm -rf .next
npm run build
pm2 start ecosystem.config.js
pm2 save

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Check if port 3000 is in use
lsof -i :3000
```

## Common Causes and Solutions

### 1. PM2 Process Not Running
**Check:**
```bash
pm2 status
```

**Fix if offline:**
```bash
cd ~/tool-thinker
pm2 start ecosystem.config.js
pm2 save
```

### 2. Build Failed or Missing
**Check:**
```bash
cd ~/tool-thinker
ls -la .next
```

**Fix:**
```bash
cd ~/tool-thinker
rm -rf .next
npm run build
pm2 restart tool-thinker
```

### 3. Port Conflict
**Check:**
```bash
lsof -i :3000
netstat -tulpn | grep 3000
```

**Fix:** Kill the process using port 3000 or change the port in `ecosystem.config.js`

### 4. Nginx Configuration Issue
**Check Nginx config:**
```bash
sudo nginx -t
```

**Check Nginx error logs:**
```bash
sudo tail -50 /var/log/nginx/error.log
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

### 5. Environment Variables Missing
**Check:**
```bash
cd ~/tool-thinker
cat .env | grep -v "^#" | grep -v "^$"
```

**Fix:** Make sure `.env` file exists with all required variables

### 6. Node.js Version Issue
**Check:**
```bash
node --version
```

**Should be Node 18+**

## Complete Reset (If Nothing Works)

```bash
cd ~/tool-thinker

# Stop everything
pm2 stop tool-thinker
pm2 delete tool-thinker

# Clean build
rm -rf .next
rm -rf node_modules/.cache

# Pull latest
git pull origin main

# Reinstall (if needed)
npm install

# Build
npm run build

# Start fresh
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs tool-thinker --lines 50
```

