import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { normalizeEmail } from './email'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { logError } from './log'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: undefined, // We're using custom sendVerificationRequest
      from: process.env.FROM_EMAIL || 'noreply@tryflowgrid.com', // Use your verified domain
      maxAge: 30 * 60, // Magic links are valid for 30 minutes
      async sendVerificationRequest({ identifier, url, provider }) {
        const normalizedEmail = normalizeEmail(identifier);
        
        try {
          const result = await resend.emails.send({
            from: provider.from,
            to: normalizedEmail,
            subject: 'Sign in to Flow Grid',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a202c; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f7fafc;">
                <div style="background: linear-gradient(135deg, #2a468b 0%, #466d60 100%); padding: 40px 20px; text-align: center;">
                  <img src="https://tryflowgrid.com/flow-grid-logo.png" alt="Flow Grid" style="height: 50px; width: auto; margin-bottom: 16px;" />
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Flow Grid</h1>
                  <p style="color: #edf2f7; margin: 8px 0 0 0; font-size: 16px;">Festival Scheduling Made Simple</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; margin: 0;">
                  <h2 style="color: #2a468b; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">Welcome back!</h2>
                  
                  <p style="font-size: 16px; color: #4a5568; margin-bottom: 30px; line-height: 1.5;">
                    Click the button below to securely sign in to your Flow Grid account:
                  </p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${url}" 
                       style="background: #ff7119; 
                              color: white; 
                              padding: 16px 40px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              font-size: 16px; 
                              font-weight: 600;
                              display: inline-block;
                              box-shadow: 0 4px 6px rgba(255, 113, 25, 0.3);">
                      Sign In to Flow Grid
                    </a>
                  </div>
                  
                  <div style="background: #f7fafc; border-left: 4px solid #466d60; padding: 16px 20px; margin: 30px 0; border-radius: 4px;">
                    <p style="font-size: 14px; color: #4a5568; margin: 0;">
                      🔒 This link will expire in <strong>30 minutes</strong> for your security.
                    </p>
                  </div>
                  
                  <p style="font-size: 14px; color: #718096; margin-top: 30px; line-height: 1.5;">
                    If you didn't request this email, you can safely ignore it. No action is required.
                  </p>
                  
                  <hr style="border: none; height: 1px; background: #e2e8f0; margin: 35px 0;">
                  
                  <p style="font-size: 13px; color: #a0aec0; line-height: 1.6; margin: 0;">
                    <strong style="color: #718096;">Having trouble?</strong><br>
                    Copy and paste this link into your browser:<br>
                    <span style="word-break: break-all; color: #4299e1;">${url}</span>
                  </p>
                </div>
                
                <div style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                    © ${new Date().getFullYear()} Flow Grid. All rights reserved.
                  </p>
                </div>
              </body>
              </html>
            `,
          });
          
          if (result.error) {
            logError('Resend API error:', result.error);
            throw new Error('Failed to send email: ' + result.error.message);
          }
        } catch (error) {
          logError('Failed to send magic link:', error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: normalizeEmail(profile.email),
          avatar: profile.picture,
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        passkeyVerified: { label: 'Passkey Verified', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const normalizedEmail = normalizeEmail(credentials.email);

        // If passkey is already verified, just find and return the user
        if (credentials.passkeyVerified === 'true') {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
          })

          if (!user) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          }
        }

        // Otherwise, require password
        if (!credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        }
      }
    }),
  ],
  callbacks: {
  async signIn({ user }) {
      // Normalize email on sign in
      if (user?.email) {
        user.email = normalizeEmail(user.email);
      }
      
      return true
    },
  async session({ session, token }) {
      // Include user ID and role in session from JWT token
      if (session?.user && token) {
        (session.user as any).id = token.sub || token.uid;
        (session.user as any).role = token.role;
      }
      return session;
    },
  async jwt({ token, user, trigger }) {
      // Persist the user ID and role to the token right after signin
      if (user) {
        // Don't overwrite sub - it's managed by NextAuth
        token.uid = user.id;
        if (user.email) {
          token.email = normalizeEmail(user.email);
        }
        // Fetch role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });
        token.role = dbUser?.role || 'USER';
      }
      
      // Refresh role from database if session is updated
      if (trigger === 'update' && token.uid) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { role: true }
        });
        token.role = dbUser?.role || 'USER';
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // Temporarily switch to JWT to test
  },
}

// Helper to get user with subscription
export async function getUserWithSubscription(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      festivals: {
        select: {
          id: true,
          name: true,
          slug: true,
          isPublished: true,
        },
      },
    },
  })
}

// Helper to check if user can create more festivals
export async function canCreateFestival(userId: string): Promise<boolean> {
  const user = await getUserWithSubscription(userId)
  if (!user?.subscription) return false

  const { subscription } = user
  
  // Check plan limits
  if (subscription.plan === 'FREE' && user.festivals.length >= 1) {
    return false
  }
  if (subscription.plan === 'PRO' && user.festivals.length >= 10) {
    return false
  }
  // ENTERPRISE = unlimited
  
  return subscription.status === 'ACTIVE'
}