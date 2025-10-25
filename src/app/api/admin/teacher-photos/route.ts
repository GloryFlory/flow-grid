import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const photos = await prisma.teacherPhoto.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching teacher photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teacher photos' },
      { status: 500 }
    )
  }
}