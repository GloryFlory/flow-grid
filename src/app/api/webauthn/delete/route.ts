import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/log'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { credentialId } = await request.json()

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
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

    // Delete the credential (ensure it belongs to the user)
    const deleted = await prisma.webAuthnCredential.deleteMany({
      where: {
        credentialId,
        userId: user.id,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Passkey not found or does not belong to you' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Delete passkey error:', error)
    return NextResponse.json(
      { error: 'Failed to delete passkey' },
      { status: 500 }
    )
  }
}
