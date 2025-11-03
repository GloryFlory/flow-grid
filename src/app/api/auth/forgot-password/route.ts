import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        accounts: {
          select: {
            provider: true
          }
        }
      }
    })

    console.log(`🔍 User lookup for ${email.toLowerCase()}:`, {
      found: !!user,
      hasPassword: !!user?.password,
      userId: user?.id,
      oauthProviders: user?.accounts.map(a => a.provider)
    })

    // Check if user exists but only uses OAuth (no password)
    if (user && !user.password && user.accounts.length > 0) {
      const providers = user.accounts.map(a => a.provider).join(', ')
      console.log(`⚠️ User ${email} only uses OAuth (${providers}), cannot reset password`)
      return NextResponse.json({
        error: `This account uses ${providers} sign-in. Please sign in with ${providers} instead of using a password.`,
        isOAuthOnly: true
      }, { status: 400 })
    }

    // Only send email if user exists with password
    if (user && user.password) {
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

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
      console.log(`📧 Password reset requested for ${email}`)
      console.log(`🔗 Reset URL: ${resetUrl}`)
      
      try {
        // Send password reset email via Resend
        await sendPasswordResetEmail({
          to: email,
          resetUrl,
          userName: user.name || undefined
        })
        console.log(`✅ Password reset email sent to ${email}`)
      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError)
        return NextResponse.json({
          error: 'Failed to send reset email. Please try again later.'
        }, { status: 500 })
      }
    } else if (!user) {
      console.log(`⚠️ Password reset requested for ${email} but user not found`)
    }

    // Return success for users with passwords
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