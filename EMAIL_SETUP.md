# Email Service Setup - Resend

## Overview
The collaboration feature now includes email invitations. We're using **Resend** as the email service provider.

## Why Resend?
- ✅ Modern, developer-friendly API
- ✅ Great for Next.js applications
- ✅ Generous free tier (3,000 emails/month)
- ✅ Easy setup and configuration
- ✅ Good deliverability
- ✅ Built-in email templates

## Alternative Options
If you prefer a different service, you can use:
- **SendGrid** - Popular, 100 emails/day free
- **AWS SES** - Very cheap, requires AWS account
- **Mailgun** - Good for transactional emails
- **Nodemailer** - For custom SMTP servers

## Setup Instructions

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email

### 2. Get API Key
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Tool Thinker Production")
4. Copy the API key (starts with `re_`)

### 3. Add Domain (Optional but Recommended)
For production, you should verify your domain:
1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Follow the DNS verification steps
4. Once verified, you can use emails like `invitations@yourdomain.com`

### 4. Add Environment Variables
Add these to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=invitations@yourdomain.com

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**For Development:**
```bash
# You can use Resend's test domain for development
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 5. Install Resend Package
```bash
npm install resend
```

## How It Works

When a project owner invites a team member:

1. **Invitation Created** - Stored in database with unique token
2. **Email Sent** - Beautiful HTML email with invitation link
3. **User Clicks Link** - Redirects to `/invite/[token]` page
4. **User Accepts** - Added as project member

## Email Template

The invitation email includes:
- Project name
- Inviter's name and email
- Role (Editor/Viewer)
- Accept button
- Direct link (for copy/paste)
- Expiration notice (7 days)

## Fallback Behavior

If email service is not configured:
- ✅ Invitation is still created in database
- ✅ Invitation URL is returned in API response
- ✅ You can manually share the link
- ⚠️ Email just won't be sent (logged to console)

## Testing

### Test Email Sending
1. Set up Resend with test domain (`onboarding@resend.dev`)
2. Invite a team member
3. Check your email inbox
4. Click the invitation link

### Test Without Email Service
1. Don't set `RESEND_API_KEY`
2. Invite a team member
3. Check console logs - you'll see the invitation URL
4. Manually share the URL with the invitee

## Production Checklist

- [ ] Create Resend account
- [ ] Get API key
- [ ] Verify your domain
- [ ] Add `RESEND_API_KEY` to production environment
- [ ] Add `RESEND_FROM_EMAIL` (use your verified domain)
- [ ] Add `NEXT_PUBLIC_APP_URL` (your production URL)
- [ ] Test invitation flow end-to-end
- [ ] Monitor email delivery in Resend dashboard

## Cost

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for most startups

**Paid Plans:**
- $20/month for 50,000 emails
- $80/month for 200,000 emails

## Troubleshooting

### Emails Not Sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified (if using custom domain)
3. Check Resend dashboard for errors
4. Check server logs for email errors

### Emails Going to Spam
1. Verify your domain with Resend
2. Set up SPF and DKIM records
3. Use a professional "from" email address
4. Avoid spam trigger words in subject/content

### Development Testing
- Use `onboarding@resend.dev` for testing (no domain verification needed)
- All test emails go to your Resend account email
- Perfect for development and testing

## Code Location

- Email service: `lib/email.ts`
- Invitation API: `app/api/projects/[projectId]/members/route.ts`
- Email template: HTML in `sendInvitationEmail()` function

