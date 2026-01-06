# Fix: "No authorization code received" Error

## The Problem

When you click "Sign in with Google", Supabase redirects you back, but the authorization code isn't being passed to your callback page. This is a **redirect URL configuration issue** in Supabase.

## The Solution

You need to configure the redirect URL in Supabase's URL Configuration settings.

### Step 1: Configure Redirect URLs in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add:
   ```
   http://localhost:3001/auth/callback
   ```
5. Click **Save**

### Step 2: Verify Site URL

Make sure your **Site URL** is set to:
```
http://localhost:3001
```

### Step 3: How Supabase OAuth Works

The OAuth flow is:
1. User clicks "Sign in with Google" → Redirects to Supabase
2. Supabase redirects to Google → User authenticates
3. Google redirects back to Supabase → Supabase processes auth
4. **Supabase redirects to your callback URL** (this is where the code comes from)

The `redirectTo` in your code tells Supabase where to send the user AFTER it processes the OAuth. But Supabase also needs this URL in its **allowed redirect URLs list**.

### Step 4: Test Again

1. Clear your browser cookies for localhost
2. Go to `/signin`
3. Click "Sign in with Google"
4. After Google authentication, you should be redirected to `/auth/callback` with a code parameter

## Alternative: Check Browser Console

If it still doesn't work:
1. Open browser DevTools (F12)
2. Go to the **Network** tab
3. Try signing in with Google
4. Look for the redirect to `/auth/callback`
5. Check what parameters are in the URL (code, error, etc.)

## Common Issues

### Issue: Code is in hash fragment (#) instead of query (?)
- **Fix**: The updated callback page now checks both query params and hash fragments

### Issue: Supabase redirects to wrong URL
- **Fix**: Make sure the redirect URL in Supabase matches exactly: `http://localhost:3001/auth/callback`

### Issue: CORS or security errors
- **Fix**: Make sure your Site URL in Supabase is set to `http://localhost:3001`

