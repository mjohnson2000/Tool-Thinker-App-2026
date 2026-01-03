# Deployment Guide for Hostinger

This guide will help you deploy your Tool Thinker app to Hostinger with automatic restart and monitoring.

## Prerequisites

- Hostinger VPS or hosting with SSH access
- Node.js installed (v18 or higher)
- npm or yarn installed

## Step 1: Install PM2 (Process Manager)

PM2 will keep your app running and automatically restart it if it crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

## Step 2: Build Your App

```bash
# Install dependencies
npm install

# Build the production version
npm run build
```

## Step 3: Set Up Environment Variables

Make sure your `.env` file (or `.env.production`) has all required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
PORT=3000
```

## Step 4: Start with PM2

```bash
# Start the app using PM2
npm run pm2:start

# Or directly:
pm2 start ecosystem.config.js
```

## Step 5: Save PM2 Configuration

This ensures PM2 restarts your app after server reboot:

```bash
# Save current PM2 process list
npm run pm2:save

# Setup PM2 to start on system boot
pm2 startup

# Follow the instructions it gives you (usually involves running a sudo command)
```

## Step 6: Verify It's Running

```bash
# Check status
pm2 status

# View logs
npm run pm2:logs

# Or use PM2 monitoring dashboard
npm run pm2:monit
```

## Step 7: Set Up Reverse Proxy (Nginx)

If you're using Nginx, create a configuration file:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then restart Nginx:
```bash
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Useful PM2 Commands

```bash
# View all processes
pm2 list

# Stop the app
npm run pm2:stop

# Restart the app
npm run pm2:restart

# View logs
npm run pm2:logs

# Monitor resources
npm run pm2:monit

# Delete from PM2
npm run pm2:delete

# Reload app (zero-downtime restart)
pm2 reload tool-thinker
```

## Health Check Monitoring

Your app includes a health check endpoint at `/api/health`. You can:

1. **Set up external monitoring** (UptimeRobot, Pingdom, etc.) to check:
   ```
   https://yourdomain.com/api/health
   ```

2. **Use PM2's built-in monitoring**:
   ```bash
   pm2 monit
   ```

## Auto-Restart Features

PM2 will automatically restart your app if:
- ✅ The app crashes
- ✅ Memory exceeds 500MB (configurable in `ecosystem.config.js`)
- ✅ Server reboots (after `pm2 startup`)
- ✅ Process exits unexpectedly

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs tool-thinker --lines 100

# Check if port is in use
lsof -i :3000

# Restart PM2
pm2 restart tool-thinker
```

### App keeps restarting
```bash
# Check error logs
pm2 logs tool-thinker --err

# Check memory usage
pm2 monit

# Increase memory limit in ecosystem.config.js
# Change: max_memory_restart: '500M' to '1G'
```

### Port already in use
```bash
# Find what's using the port
lsof -i :3000

# Kill the process or change PORT in .env
```

## Updating Your App

When you need to update:

```bash
# Pull latest changes
git pull

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart with PM2 (zero-downtime)
pm2 reload tool-thinker

# Or full restart
pm2 restart tool-thinker
```

## Monitoring & Alerts

Consider setting up:
- **Uptime monitoring**: UptimeRobot (free) or Pingdom
- **Error tracking**: Sentry (free tier available)
- **Log aggregation**: PM2 Plus (free for 1 app) or self-hosted

## Security Notes

1. **Keep PM2 updated**: `npm update -g pm2`
2. **Use HTTPS**: Set up SSL certificate (Let's Encrypt is free)
3. **Firewall**: Only open necessary ports (80, 443, 22)
4. **Environment variables**: Never commit `.env` files

## Backup Strategy

1. **Database**: Supabase has automatic backups (Pro plan)
2. **Code**: Git repository
3. **Environment**: Keep `.env` backed up securely

## Performance Tips

1. **Enable caching**: Use Next.js ISR (Incremental Static Regeneration)
2. **CDN**: Use Cloudflare or similar for static assets
3. **Database**: Monitor Supabase usage and optimize queries
4. **PM2 clustering**: For high traffic, increase `instances` in `ecosystem.config.js`

---

**Your app is now production-ready with automatic restart and monitoring!** 🚀

