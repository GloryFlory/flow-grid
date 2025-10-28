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
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
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
          image: user.avatar,
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Include user ID in session from database user
      if (session?.user && user) {
        (session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
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