# PM2 Quick Start Guide

## What is PM2?

PM2 is a process manager that keeps your Node.js app running 24/7 with automatic restart on crashes.

## Quick Setup (3 Steps)

### 1. Install PM2
```bash
npm install -g pm2
```

### 2. Deploy Your App
```bash
npm run deploy
```

This will:
- Install dependencies
- Build your app
- Start it with PM2
- Save the configuration

### 3. Set Up Auto-Start on Reboot
```bash
pm2 startup
# Follow the instructions (usually run a sudo command)
pm2 save
```

## That's It! 🎉

Your app will now:
- ✅ Stay running 24/7
- ✅ Auto-restart if it crashes
- ✅ Auto-start after server reboot
- ✅ Restart if memory gets too high (>500MB)

## Common Commands

```bash
# View status
pm2 status

# View logs
pm2 logs tool-thinker

# Restart app
pm2 restart tool-thinker

# Stop app
pm2 stop tool-thinker

# Monitor (CPU, Memory, etc.)
pm2 monit
```

## Health Check

Your app has a health endpoint:
```
http://localhost:3000/api/health
```

Use this for external monitoring services.

## Troubleshooting

**App won't start?**
```bash
pm2 logs tool-thinker --lines 100
```

**App keeps restarting?**
```bash
pm2 logs tool-thinker --err
```

**Need to update?**
```bash
git pull
npm install
npm run build
pm2 restart tool-thinker
```

## Full Documentation

See `DEPLOYMENT.md` for complete deployment guide.

