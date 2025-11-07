import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Count total number of names across all bookings, not just booking records
    const bookings = await prisma.booking.findMany({
      where: { sessionId },
      select: { names: true }
    });

    const count = bookings.reduce((sum, booking) => sum + booking.names.length, 0);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching booking count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking count' },
      { status: 500 }
    );
  }
}
