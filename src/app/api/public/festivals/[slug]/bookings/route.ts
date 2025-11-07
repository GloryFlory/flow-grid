import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all bookings for a device
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const festival = await prisma.festival.findUnique({
      where: { slug }
    });

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        festivalId: festival.id,
        deviceId
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
