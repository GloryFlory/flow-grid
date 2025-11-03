import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/log'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const credentials = await prisma.webAuthnCredential.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        credentialId: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      credentials,
    })
  } catch (error) {
    logError('List passkeys error:', error)
    return NextResponse.json(
      { error: 'Failed to list passkeys' },
      { status: 500 }
    )
  }
}
