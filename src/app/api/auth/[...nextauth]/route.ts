import NextAuth from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Create handler and export it properly for Next.js 13+ App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }