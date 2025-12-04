import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyNextInWaitlist } from '@/lib/waitlist';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: festivalId, bookingId } = await params;

    // Verify user owns this festival
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or access denied' },
        { status: 404 }
      );
    }

    // Get the booking to know the sessionId before deleting
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        festivalId
      },
      select: {
        sessionId: true,
      }
    });

    // Delete the booking
    await prisma.booking.delete({
      where: {
        id: bookingId,
        festivalId
      }
    });

    // Notify next person on waitlist (fire and forget)
    if (booking?.sessionId) {
      notifyNextInWaitlist(booking.sessionId).catch(err => {
        console.error('Failed to notify waitlist:', err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
