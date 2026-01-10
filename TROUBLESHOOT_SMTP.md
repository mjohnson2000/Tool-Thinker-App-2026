# Troubleshooting: Password Reset Email Not Sending

## Issue: Email not received after configuring Supabase SMTP

### Quick Fix: Use Resend Test Domain

If your domain isn't verified in Resend yet, use the test domain:

1. **In Supabase SMTP Settings:**
   - Change **Sender email address** from `mjohnson@toolthinker.com` to:
   - `onboarding@resend.dev`
   - Keep **Sender name** as `Tool Thinker`
   - Click **Save changes**

2. **Test again** - This should work immediately

### Verify These Settings:

- ✅ **Host**: `smtp.resend.com`
- ✅ **Port**: `587`
- ✅ **Username**: `resend`
- ⚠️ **Password**: Must be your full Resend API key: `re_sTcg6H2m_JsGFgQ5GSFvoUFvoVUXmrreX`
- ⚠️ **Sender Email**: Use `onboarding@resend.dev` for testing (or verify your domain in Resend)

### Check Supabase Logs:

1. Go to Supabase Dashboard > **Logs** > **Auth Logs**
2. Look for any SMTP connection errors
3. Check for authentication failures

### Verify Resend Domain (For Production):

1. Go to https://resend.com/domains
2. Add and verify `toolthinker.com`
3. Then you can use `noreply@toolthinker.com` or `mjohnson@toolthinker.com`

### Common Issues:

1. **Password is wrong**: Make sure it's the full API key, not truncated
2. **Domain not verified**: Use `onboarding@resend.dev` for testing
3. **SMTP port wrong**: Should be `587` (not `465` unless using SSL)
4. **Email in spam**: Check spam folder
5. **Supabase SMTP error**: Check Supabase logs for connection issues

