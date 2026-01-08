/**
 * Email service using Resend
 * Alternative options: SendGrid, AWS SES, Mailgun, Nodemailer
 */

// Initialize Resend client (only if API key is available)
let resend: any = null

// Lazy load Resend to avoid errors if package not installed
try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend')
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (error) {
  // Resend package not installed - that's okay, emails just won't send
  console.log('Resend package not installed. Email functionality disabled.')
}

interface InvitationEmailParams {
  to: string
  inviterName: string
  inviterEmail: string
  projectName: string
  inviteUrl: string
  role: 'editor' | 'viewer'
}

/**
 * Send project invitation email
 */
export async function sendInvitationEmail(params: InvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  // If no email service configured, log and return success (don't block invitation)
  if (!resend) {
    console.log('📧 Email service not configured. Invitation URL:', params.inviteUrl)
    return { success: true }
  }

  try {
    const roleLabel = params.role === 'editor' ? 'Editor' : 'Viewer'
    const roleDescription = params.role === 'editor' 
      ? 'You can edit and contribute to the project.'
      : 'You can view the project and its contents.'

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Tool Thinker <invitations@toolthinker.com>',
      to: params.to,
      subject: `${params.inviterName} invited you to collaborate on "${params.projectName}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-top: 0;">
                <strong>${params.inviterName}</strong> (${params.inviterEmail}) has invited you to collaborate on the project:
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 22px;">${params.projectName}</h2>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <strong>Role:</strong> ${roleLabel} - ${roleDescription}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${params.inviteUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <a href="${params.inviteUrl}" style="color: #667eea; word-break: break-all;">${params.inviteUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This invitation will expire in 7 days. If you don't have a Tool Thinker account, you'll be prompted to create one when you accept.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This email was sent by Tool Thinker. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
You're Invited to Collaborate!

${params.inviterName} (${params.inviterEmail}) has invited you to collaborate on the project: ${params.projectName}

Role: ${roleLabel} - ${roleDescription}

Accept the invitation by clicking this link:
${params.inviteUrl}

This invitation will expire in 7 days. If you don't have a Tool Thinker account, you'll be prompted to create one when you accept.

---
This email was sent by Tool Thinker. If you didn't expect this invitation, you can safely ignore this email.
      `.trim(),
    })

    if (error) {
      console.error('Failed to send invitation email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending invitation email:', error)
    return { success: false, error: errorMessage }
  }
}

