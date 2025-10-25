import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary debug endpoint to check what's in the database
export async function GET() {
  try {
    const festivals = await prisma.festival.findMany({
      include: {
        sessions: {
          take: 3 // Just get a few sessions to see data
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            festivals: true
          }
        }
      }
    })

    return NextResponse.json({ 
      festivals: festivals.length,
      festivalData: festivals,
      users: users.length,
      userData: users
    })
  } catch (error) {
    console.error('Error fetching debug data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error },
      { status: 500 }
    )
  }
}