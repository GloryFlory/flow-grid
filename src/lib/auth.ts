import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
        console.log('🔍 Google profile data:', {
          sub: profile.sub,
          email: profile.email,
          name: profile.name,
          picture: profile.picture
        })
        
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture, // Map Google's 'picture' to our 'avatar' field
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing email or password')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        console.log('👤 User found:', { 
          found: !!user, 
          hasPassword: !!user?.password,
          userId: user?.id 
        })

        if (!user || !user.password) {
          console.log('❌ User not found or no password')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('🔑 Password check:', { isValid: isPasswordValid })

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          return null
        }

        console.log('✅ Authentication successful for:', user.email)
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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🚪 SignIn callback:', {
        provider: account?.provider,
        userEmail: user?.email,
        profileEmail: (profile as any)?.email,
        accountId: account?.id,
        userId: user?.id
      })
      return true
    },
    async session({ session, token }) {
      console.log('🎫 Session callback called (JWT):', { 
        hasSession: !!session, 
        hasToken: !!token,
        tokenSub: token?.sub,
        sessionUserId: (session?.user as any)?.id,
        sessionEmail: session?.user?.email
      })
      
      // Include user ID in session from JWT token
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub
        console.log('🎫 Session updated with user ID from token:', token.sub)
      }
      
      console.log('🎫 Final session:', session)
      return session
    },
    async jwt({ token, user, account }) {
      console.log('🔑 JWT callback called:', {
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        userId: user?.id,
        userEmail: user?.email,
        tokenSub: token?.sub,
        tokenEmail: token?.email
      })
      
      // Persist the user ID to the token right after signin
      if (user) {
        token.sub = user.id
        console.log('🔑 JWT token updated with user ID:', user.id)
      }
      
      return token
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