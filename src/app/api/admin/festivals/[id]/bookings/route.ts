import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: festivalId } = await params;

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    const isAdmin = currentUser?.role === 'ADMIN'

    // Verify user owns this festival (or is admin)
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        // Admins can access any festival, others only their own
        ...(isAdmin ? {} : { user: { email: session.user.email } })
      }
    });

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or access denied' },
        { status: 404 }
      );
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
