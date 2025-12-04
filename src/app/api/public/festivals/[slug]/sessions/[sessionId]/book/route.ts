import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNextInWaitlist } from '@/lib/waitlist';

// Create a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  try {
    const { slug, sessionId } = await params;
    const body = await request.json();
    const { names, email, deviceId } = body;

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json(
        { error: 'At least one name is required' },
        { status: 400 }
      );
    }

    if (!email || !deviceId) {
      return NextResponse.json(
        { error: 'Email and device ID are required' },
        { status: 400 }
      );
    }

    // Get the festival and session
    const festival = await prisma.festival.findUnique({
      where: { slug }
    });

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      );
    }

    const session = await prisma.festivalSession.findUnique({
      where: { id: sessionId }
    }) as any;
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if booking is enabled
    if (!session.bookingEnabled) {
      return NextResponse.json(
        { error: 'Booking is not enabled for this session' },
        { status: 400 }
      );
    }

    // Check capacity - count total number of names across all bookings
    if (session.bookingCapacity) {
      const allBookings = await prisma.booking.findMany({
        where: { sessionId },
        select: { names: true }
      });
      
      const totalBookedSpots = allBookings.reduce((sum, booking) => sum + booking.names.length, 0);
      const spotsRequested = names.length;
      
      if (totalBookedSpots + spotsRequested > session.bookingCapacity) {
        const spotsAvailable = session.bookingCapacity - totalBookedSpots;
        return NextResponse.json(
          { error: `Not enough spots available. Only ${spotsAvailable} spot(s) left.` },
          { status: 400 }
        );
      }

      // Check if there's anyone on the waitlist with an active offer
      // They have priority over new bookings
      const activeWaitlistOffers = await prisma.sessionWaitlist.findFirst({
        where: {
          sessionId,
          status: 'OFFERED',
          offerExpiresAt: { gt: new Date() }
        }
      });

      if (activeWaitlistOffers) {
        return NextResponse.json(
          { error: 'Spots are currently reserved for waitlist members. Please try again later or join the waitlist.' },
          { status: 400 }
        );
      }

      // Also check if session is full and has waitlist entries
      // In this case, new users should join the waitlist instead
      if (totalBookedSpots >= session.bookingCapacity) {
        const waitlistCount = await prisma.sessionWaitlist.count({
          where: { sessionId, status: 'WAITING' }
        });
        
        if (waitlistCount > 0) {
          return NextResponse.json(
            { error: 'Session is full. Please join the waitlist.' },
            { status: 400 }
          );
        }
      }
    }

    // Check if already booked
    const existingBooking = await prisma.booking.findUnique({
      where: {
        sessionId_deviceId: {
          sessionId,
          deviceId
        }
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You have already booked this session' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        names,
        email,
        deviceId,
        sessionId,
        festivalId: festival.id
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        sessionId_deviceId: {
          sessionId,
          deviceId
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const namesCount = booking.names.length;

    await prisma.booking.delete({
      where: {
        sessionId_deviceId: {
          sessionId,
          deviceId
        }
      }
    });

    // Notify waitlist members - one person per freed spot
    // This runs in background so we don't block the response
    (async () => {
      for (let i = 0; i < namesCount; i++) {
        try {
          const notified = await notifyNextInWaitlist(sessionId);
          if (!notified) {
            // No more people waiting
            break;
          }
          console.log(`Notified waitlist member ${i + 1}/${namesCount}: ${notified.email}`);
        } catch (err) {
          console.error(`Failed to notify waitlist member ${i + 1}:`, err);
        }
      }
    })();

    return NextResponse.json({ success: true, namesCount });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
