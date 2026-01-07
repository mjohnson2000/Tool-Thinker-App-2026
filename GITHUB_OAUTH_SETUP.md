# GitHub OAuth Setup Guide

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"** (or **"OAuth Apps"** > **"New OAuth App"**)
3. Fill in the application details:
   - **Application name**: `Tool Thinker` (or your preferred name)
   - **Homepage URL**: `http://localhost:3001` (for development)
   - **Authorization callback URL**: 
     ```
     https://dejhoudyhqjxbcnrixdd.supabase.co/auth/v1/callback
     ```
     ⚠️ **Important**: This must match exactly - copy from your Supabase dashboard
4. Click **"Register application"**
5. You'll see your **Client ID** - copy it
6. Click **"Generate a new client secret"** - copy the secret immediately (you won't see it again!)

## Step 2: Add Credentials to Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **GitHub** and click on it
5. Toggle **"Enable Sign in with GitHub"** to ON
6. Paste your credentials:
   - **Client ID**: Paste your GitHub Client ID
   - **Client Secret**: Paste your GitHub Client Secret
7. Click **"Save"**

## Step 3: Configure Redirect URLs in Supabase

1. In Supabase, go to **Authentication** > **URL Configuration**
2. Make sure **Site URL** is set to:
   ```
   http://localhost:3001
   ```
3. In **Redirect URLs**, make sure you have:
   ```
   http://localhost:3001/auth/callback
   ```
4. Click **"Save"**

## Step 4: Test GitHub Sign-In

1. Go to your app: `http://localhost:3001/signin`
2. Click **"Sign in with GitHub"**
3. You should be redirected to GitHub's authorization page
4. After authorizing, you'll be redirected back and signed in!

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the Authorization callback URL in GitHub matches exactly:
  - `https://dejhoudyhqjxbcnrixdd.supabase.co/auth/v1/callback`
- No trailing slashes, no spaces

### "Invalid client" error
- Check that your Client ID and Client Secret are correct in Supabase
- Make sure there are no extra spaces when copying/pasting

### "Application not found" error
- Verify your GitHub OAuth app is created and active
- Check that you're using the correct Client ID

### Still not working?
1. Clear browser cookies
2. Try in incognito/private window
3. Check Supabase logs: **Logs** > **Auth Logs**
4. Check browser console (F12) for errors

## Production Setup

When you're ready for production:

1. **Update GitHub OAuth App**:
   - Go back to your GitHub OAuth app settings
   - Update **Homepage URL** to your production domain
   - Update **Authorization callback URL** to:
     ```
     https://dejhoudyhqjxbcnrixdd.supabase.co/auth/v1/callback
     ```
     (This stays the same - Supabase handles the callback)

2. **Update Supabase**:
   - Go to **Authentication** > **URL Configuration**
   - Update **Site URL** to your production domain
   - Add production redirect URL:
     ```
     https://yourdomain.com/auth/callback
     ```

