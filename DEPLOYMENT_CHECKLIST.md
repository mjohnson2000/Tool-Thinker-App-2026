# Server Deployment Checklist

## ⚠️ Before Deploying These Changes

### Quick Answer: **NO, you don't HAVE to do anything before updating the server**

The changes are **backward compatible** - your server will continue working even if:
- Environment variables aren't perfectly formatted
- Some env vars are missing (optional ones)

### What Changed:
1. ✅ **Environment validation** - Now warns instead of crashing in production
2. ✅ **Error boundaries** - Better error handling (won't break anything)
3. ✅ **Logging utility** - Only used in 2 files, rest still use console
4. ✅ **TypeScript config** - Just fixes false errors, doesn't affect runtime

### Server Requirements:
Your server should already have these in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `OPENAI_API_KEY` (optional, but needed for AI features)
- `OPENAI_MODEL` (optional, defaults to gpt-4o-mini)

## 🚀 Safe to Deploy

**You can deploy these changes without any preparation** - they're improvements, not breaking changes.

### If You Want to Be Extra Safe:

1. **Check your server's .env file has these:**
   ```bash
   # On your server
   cat .env | grep -E "SUPABASE|OPENAI"
   ```

2. **If missing, add them:**
   ```bash
   nano .env
   # Add any missing variables
   ```

3. **Restart after deployment:**
   ```bash
   pm2 restart tool-thinker
   ```

## 📝 What Happens If Env Vars Are Missing?

- **Development:** Will throw error (helps catch issues early)
- **Production:** Will log warning but continue running (backward compatible)

The server will **NOT crash** from missing env vars in production.

