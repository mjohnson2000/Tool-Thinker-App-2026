# Consultation API Fix Guide

## Problem
The consultation tool shows: "I apologize, but I'm having trouble processing your request right now."

## Common Causes

### 1. Missing OPENAI_API_KEY (Most Common)
The API requires an OpenAI API key to function.

**Check:**
```bash
# On your server
cd ~/tool-thinker
cat .env | grep OPENAI_API_KEY
```

**Fix:**
```bash
# 1. Get your API key from: https://platform.openai.com/api-keys
# 2. Edit .env file
nano .env

# 3. Add or update:
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini

# 4. Restart the app
pm2 restart tool-thinker
```

### 2. Environment Variables Not Loaded
PM2 might not be loading the .env file.

**Fix:**
```bash
# Option 1: Update ecosystem.config.js to load .env
# Or restart PM2 with explicit env vars

# Option 2: Use PM2's env feature
pm2 restart tool-thinker --update-env
```

### 3. API Key Invalid or Expired
The API key might be invalid or have expired.

**Check:**
```bash
# Test the API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Fix:**
- Get a new API key from OpenAI dashboard
- Update .env file
- Restart the app

### 4. Network/Firewall Issues
The server might not be able to reach OpenAI's API.

**Check:**
```bash
# Test connectivity
curl -I https://api.openai.com
```

**Fix:**
- Check firewall rules
- Ensure outbound HTTPS (443) is allowed
- Check if behind a proxy

### 5. Rate Limiting
OpenAI might be rate limiting your requests.

**Check PM2 logs:**
```bash
pm2 logs tool-thinker --err --lines 50
```

Look for:
- "rate_limit_exceeded"
- "insufficient_quota"
- "429" status codes

**Fix:**
- Check your OpenAI account usage
- Upgrade your plan if needed
- Wait for rate limit to reset

## Quick Diagnostic Script

Run this on your server to diagnose the issue:

```bash
bash fix-consultation-api.sh
```

Or manually check:

```bash
# 1. Check if .env exists and has API key
cd ~/tool-thinker
cat .env | grep OPENAI_API_KEY

# 2. Test API endpoint
curl -X POST http://localhost:3000/api/consultation/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# 3. Check PM2 logs
pm2 logs tool-thinker --err --lines 20

# 4. Check if app is running
pm2 status
```

## Step-by-Step Fix

### Step 1: Verify .env File
```bash
cd ~/tool-thinker
ls -la .env
cat .env
```

### Step 2: Set OpenAI API Key
```bash
# Edit .env file
nano .env

# Add or update:
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Step 3: Restart Application
```bash
# Restart PM2 to load new environment variables
pm2 restart tool-thinker

# Or stop and start fresh
pm2 stop tool-thinker
pm2 delete tool-thinker
pm2 start ecosystem.config.js
pm2 save
```

### Step 4: Test the API
```bash
# Test locally
curl -X POST http://localhost:3000/api/consultation/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Should return JSON with a "response" field
```

### Step 5: Check Browser Console
Open browser DevTools (F12) → Console tab → Look for errors when using the consultation tool.

## Environment Variables Setup

Create or update `.env` file in the project root:

```bash
# Required for Consultation API
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini

# Optional - for other features
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## PM2 Environment Variables

If PM2 isn't loading .env automatically, you can:

### Option 1: Use dotenv in ecosystem.config.js
```javascript
require('dotenv').config()

module.exports = {
  apps: [{
    name: 'tool-thinker',
    // ... rest of config
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    }
  }]
}
```

### Option 2: Set environment variables in PM2
```bash
pm2 restart tool-thinker --update-env
```

## Testing

After fixing, test the consultation tool:

1. Go to: `https://toolthinker.com/consultation`
2. Type a message
3. Should get AI response (not error message)

If still not working, check:
- Browser console for errors
- PM2 logs: `pm2 logs tool-thinker`
- API endpoint directly: `curl -X POST http://localhost:3000/api/consultation/chat ...`

