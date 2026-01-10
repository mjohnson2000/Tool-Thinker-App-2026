# Supabase Email Configuration - Password Reset

To make password reset emails come from "Tool Thinker" instead of Supabase, configure Supabase's custom SMTP settings.

## Recommended Solution: Configure Supabase Custom SMTP with Resend

This is the best approach because:
- ✅ Emails come from "Tool Thinker" 
- ✅ Uses Supabase's secure token system
- ✅ Single email (no duplicates)
- ✅ Proper reset links with tokens

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Settings** > **Auth**
   - Scroll to **SMTP Settings**

2. **Enable Custom SMTP**
   - Toggle **"Enable Custom SMTP"** to ON

3. **Configure Resend SMTP Settings**:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **SMTP User**: `resend`
   - **SMTP Password**: Your Resend API key (same as `RESEND_API_KEY` in your `.env`)
   - **Sender Email**: Your verified Resend email address (e.g., `noreply@toolthinker.com`)
   - **Sender Name**: `Tool Thinker`

4. **Customize Email Template** (Optional but recommended):
   - Go to **Authentication** > **Email Templates**
   - Find **"Reset Password"** template
   - Customize the subject: "Reset Your Tool Thinker Password"
   - Update the email content to match Tool Thinker branding
   - The template can use variables like `{{ .ConfirmationURL }}` for the reset link

5. **Save Changes**

### After Configuration:

- Password reset emails will come from "Tool Thinker <noreply@toolthinker.com>"
- The reset link will work correctly with Supabase's token system
- You can disable our custom email sending in the API if desired

## Current Implementation

The app currently:
- ✅ Sends a custom branded email via Resend (from "Tool Thinker")
- ✅ Still uses Supabase's secure password reset token system
- ⚠️ Supabase may also send its default email until SMTP is configured

**After configuring Supabase SMTP**, you can optionally remove the custom email sending from `/api/auth/forgot-password/route.ts` to avoid duplicate emails.

## Environment Variables Needed

Make sure you have these in your `.env`:
```
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Tool Thinker <noreply@toolthinker.com>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Alternative: Use Only Custom Email (Not Recommended)

If you want to use only our custom Resend email (without Supabase's):
- This requires more complex token management
- Less secure (bypasses Supabase's built-in security)
- Not recommended - use Supabase SMTP configuration instead

