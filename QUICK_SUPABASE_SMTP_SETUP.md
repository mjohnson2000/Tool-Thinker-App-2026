# Quick Setup: Make Password Reset Emails Come From "Tool Thinker"

## The Problem
When you request a password reset, Supabase automatically sends an email. By default, this email comes from Supabase, not "Tool Thinker".

## The Solution: Configure Supabase SMTP (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `dejhoudyhqjxbcnrixdd`

### Step 2: Configure Custom SMTP
**Option A (Newer Supabase UI):**
1. Click **"Authentication"** in the left sidebar (not Settings)
2. Look for **"SMTP Settings"** or **"Email"** section
3. Toggle **"Enable Custom SMTP"** to **ON**

**Option B (If SMTP is in Settings):**
1. Go to **Settings** (gear icon in left sidebar)
2. Click **Auth** tab at the top of the settings page
3. Scroll down to **SMTP Settings**
4. Toggle **"Enable Custom SMTP"** to **ON**

### Step 3: Enter Resend SMTP Details
Use these exact values:

- **SMTP Host**: `smtp.resend.com`
- **SMTP Port**: `587` (or `465` for SSL)
- **SMTP User**: `resend`
- **SMTP Password**: `re_sTcg6H2m_JsGFgQ5GSFvoUFvoVUXmrreX` (your Resend API key from .env)
- **Sender Email**: `noreply@toolthinker.com` (must be verified in Resend)
- **Sender Name**: `Tool Thinker`

### Step 4: Customize Email Template (Optional)
1. Go to **Authentication** > **Email Templates**
2. Find **"Reset Password"** template
3. Update:
   - **Subject**: `Reset Your Tool Thinker Password`
   - **From Name**: `Tool Thinker`
   - Customize the email body to match your branding

### Step 5: Save and Test
1. Click **Save** in SMTP Settings
2. Test by requesting a password reset
3. The email should now come from "Tool Thinker"

## Alternative: Use Resend Test Domain (For Testing)
If you haven't verified your domain yet, you can use Resend's test domain:
- **Sender Email**: `onboarding@resend.dev`
- This works immediately without domain verification

## After Setup
Once configured, Supabase will send password reset emails through Resend, so they'll come from "Tool Thinker" instead of Supabase.

