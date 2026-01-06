# OAuth Setup Guide for Google and GitHub

## Common OAuth Errors

If you're getting errors when trying to sign in with Google or GitHub, follow these steps:

## Step 1: Configure OAuth Providers in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable the providers you want (Google, GitHub, etc.)

### For Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3001/auth/callback` (for local development)
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase under **Authentication** > **Providers** > **Google**

### For GitHub OAuth:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Tool Thinker (or your app name)
   - **Homepage URL**: `http://localhost:3001` (or your production URL)
   - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**
6. Paste them into Supabase under **Authentication** > **Providers** > **GitHub**

## Step 2: Configure Redirect URLs in Supabase

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - Development: `http://localhost:3001`
   - Production: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:3001/auth/callback`
   - `https://yourdomain.com/auth/callback`

## Step 3: Common Error Messages and Fixes

### "redirect_uri_mismatch"
- **Fix**: Make sure the redirect URL in your OAuth provider (Google/GitHub) matches exactly:
  - `https://your-project-ref.supabase.co/auth/v1/callback`

### "invalid_client"
- **Fix**: Check that your Client ID and Client Secret are correct in Supabase

### "access_denied"
- **Fix**: User cancelled the OAuth flow - this is normal, just try again

### "OAuth exchange error"
- **Fix**: Check that the callback route is accessible and the code parameter is being received

## Step 4: Test the OAuth Flow

1. Go to `/signin` page
2. Click "Sign in with Google" or "Sign in with GitHub"
3. You should be redirected to the provider's login page
4. After authentication, you should be redirected back to `/dashboard`

## Troubleshooting

### Check Browser Console
- Open browser DevTools (F12)
- Check the Console tab for any errors
- Check the Network tab to see if requests are failing

### Check Supabase Logs
- Go to Supabase dashboard > **Logs** > **Auth Logs**
- Look for any error messages related to OAuth

### Verify Environment Variables
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Test the Callback Route
Try accessing: `http://localhost:3001/auth/callback?code=test`
- If you get a redirect, the route is working
- If you get an error, check the server logs

## Still Having Issues?

1. Make sure you've restarted your dev server after making changes
2. Clear your browser cookies and cache
3. Try in an incognito/private window
4. Check that your Supabase project is active and not paused
5. Verify that the OAuth providers are enabled in Supabase

