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

    // Get the booking to know the sessionId and names count before deleting
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        festivalId
      },
      select: {
        sessionId: true,
        names: true,
      }
    });

    // Delete the booking
    await prisma.booking.delete({
      where: {
        id: bookingId,
        festivalId
      }
    });

    // Notify waitlist members - one person per freed spot
    if (booking?.sessionId) {
      const spotsFreed = booking.names?.length || 1;
      
      // Run in background so we don't block the response
      (async () => {
        for (let i = 0; i < spotsFreed; i++) {
          try {
            const notified = await notifyNextInWaitlist(booking.sessionId);
            if (!notified) {
              // No more people waiting
              break;
            }
            console.log(`Notified waitlist member ${i + 1}/${spotsFreed}: ${notified.email}`);
          } catch (err) {
            console.error(`Failed to notify waitlist member ${i + 1}:`, err);
          }
        }
      })();
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
