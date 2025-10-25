import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// This endpoint allows you to set a user as admin
// In production, this should be protected by additional security measures
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, makeAdmin } = body

    // Check if the current user is already an admin (for security)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // Allow the first admin assignment or require existing admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    if (adminCount > 0 && currentUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can assign admin roles' },
        { status: 403 }
      )
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        role: makeAdmin ? 'ADMIN' : 'USER'
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}