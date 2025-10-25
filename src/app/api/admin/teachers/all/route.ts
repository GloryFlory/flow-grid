import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/teachers/all
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}
