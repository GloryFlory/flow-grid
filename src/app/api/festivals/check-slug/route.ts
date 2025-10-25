import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingFestival = await prisma.festival.findUnique({
      where: { slug },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingFestival,
      slug
    })
  } catch (error) {
    console.error('Error checking slug availability:', error)
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    )
  }
}