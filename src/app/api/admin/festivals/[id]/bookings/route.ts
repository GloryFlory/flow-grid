import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireFestivalAccess } from '@/lib/festival-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params;

    // Check festival access - any team member can view bookings
    const { error } = await requireFestivalAccess(festivalId);
    if (error) return error;

    // Get festival name
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      select: { name: true }
    });

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
    }

    // Get all bookings for this festival
    const bookings = await prisma.booking.findMany({
      where: {
        festivalId
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            day: true,
            startTime: true,
            endTime: true,
            location: true
          }
        }
      },
      orderBy: [
        { session: { day: 'asc' } },
        { session: { startTime: 'asc' } },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json({
      festivalName: festival.name,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
