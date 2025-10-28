import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    // But only send email if user actually exists
    if (user && user.password) { // Only for users with password (not OAuth-only)
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Save reset token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      })

      // TODO: Send email with reset link
      // For now, we'll just log it (you'll need to implement email sending)
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
      console.log(`Password reset requested for ${email}`)
      console.log(`Reset URL: ${resetUrl}`)
      
      // In production, you would send an email here using Resend, SendGrid, etc.
      /*
      const emailService = new ResendService() // or your email service
      await emailService.sendPasswordReset({
        to: email,
        resetUrl,
        userName: user.name || 'User'
      })
      */
    }

    // Always return success (security best practice)
    return NextResponse.json({
      message: 'If an account with that email exists, we sent a password reset link'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}