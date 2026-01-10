import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPasswordResetEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

/**
 * POST /api/auth/forgot-password
 * Request password reset - sends custom branded email via Resend
 * 
 * Note: This still uses Supabase's password reset token system for security,
 * but sends a custom branded email from Tool Thinker instead of Supabase's default email.
 * 
 * To fully disable Supabase's default email:
 * 1. Go to Supabase Dashboard > Authentication > Email Templates
 * 2. Disable or customize the "Reset Password" template
 * 3. Or configure custom SMTP to use Resend
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // First, trigger Supabase's password reset to generate the token
    // This will also send Supabase's default email (which we'll customize in dashboard)
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/reset-password`,
    })

    // Send our custom branded email via Resend
    // The reset URL will work because Supabase generates the token
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/reset-password`
    
    const emailResult = await sendPasswordResetEmail({
      to: email.trim(),
      resetUrl: resetUrl,
    })

    // Always return success to prevent email enumeration (security best practice)
    // Don't reveal if email exists or not
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error: unknown) {
    logger.error('Password reset request error:', error)
    // Always return success to prevent email enumeration
    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    )
  }
}

