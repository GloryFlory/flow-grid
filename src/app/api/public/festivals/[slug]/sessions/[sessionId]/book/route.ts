import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { notifyNextInWaitlist } from '@/lib/waitlist';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// Thrown from inside the booking transaction to short-circuit with a specific
// HTTP status; caught in the outer handler and turned into a JSON response.
class BookingError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Postgres error code for "could not serialize access due to concurrent update" —
// the expected/retryable failure mode for a Serializable transaction under contention.
const SERIALIZATION_FAILURE = 'P2034';

// Create a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  try {
    const { slug, sessionId } = await params;

    // Rate limit: 10 booking attempts per IP per 10 minutes.
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitResult = await rateLimit(`book:${ip}`, { max: 10, windowMs: 10 * 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

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

    // Only published festivals can be booked (findFirst since slug is the only
    // unique field and we need an extra filter — see sibling public routes).
    const festival = await prisma.festival.findFirst({
      where: { slug, isPublished: true },
      select: { id: true }
    });

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      );
    }

    // Capacity check + booking creation run inside one Serializable transaction
    // so two concurrent requests for the last spot(s) can't both pass the
    // capacity check and overbook the session. Serializable can abort with a
    // write-conflict error under contention; retry a few times when that happens.
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        const booking = await prisma.$transaction(async (tx) => {
          // Re-check the session inside the transaction, scoped to this festival —
          // a session ID from a different festival must not be bookable here.
          const session = await tx.festivalSession.findFirst({
            where: { id: sessionId, festivalId: festival.id }
          });
          if (!session) {
            throw new BookingError('Session not found', 404);
          }

          if (!session.bookingEnabled) {
            throw new BookingError('Booking is not enabled for this session', 400);
          }

          // Check capacity - count total number of names across all bookings
          if (session.bookingCapacity) {
            const allBookings = await tx.booking.findMany({
              where: { sessionId },
              select: { names: true }
            });

            const totalBookedSpots = allBookings.reduce((sum, booking) => sum + booking.names.length, 0);
            const spotsRequested = names.length;

            if (totalBookedSpots + spotsRequested > session.bookingCapacity) {
              const spotsAvailable = session.bookingCapacity - totalBookedSpots;
              throw new BookingError(`Not enough spots available. Only ${spotsAvailable} spot(s) left.`, 400);
            }

            // Check if there's anyone on the waitlist with an active offer
            // They have priority over new bookings
            const activeWaitlistOffers = await tx.sessionWaitlist.findFirst({
              where: {
                sessionId,
                status: 'OFFERED',
                offerExpiresAt: { gt: new Date() }
              }
            });

            if (activeWaitlistOffers) {
              throw new BookingError('Spots are currently reserved for waitlist members. Please try again later or join the waitlist.', 400);
            }

            // Also check if session is full and has waitlist entries
            // In this case, new users should join the waitlist instead
            if (totalBookedSpots >= session.bookingCapacity) {
              const waitlistCount = await tx.sessionWaitlist.count({
                where: { sessionId, status: 'WAITING' }
              });

              if (waitlistCount > 0) {
                throw new BookingError('Session is full. Please join the waitlist.', 400);
              }
            }
          }

          // Check if already booked
          const existingBooking = await tx.booking.findUnique({
            where: {
              sessionId_deviceId: {
                sessionId,
                deviceId
              }
            }
          });

          if (existingBooking) {
            throw new BookingError('You have already booked this session', 400);
          }

          // Create booking
          return tx.booking.create({
            data: {
              names,
              email,
              deviceId,
              sessionId,
              festivalId: festival.id
            }
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        return NextResponse.json(booking);
      } catch (error) {
        if (error instanceof BookingError) {
          return NextResponse.json({ error: error.message }, { status: error.status });
        }
        const isSerializationFailure =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === SERIALIZATION_FAILURE;
        if (isSerializationFailure && attempt < 3) {
          continue; // Retry — another concurrent booking won the race, re-check capacity fresh.
        }
        throw error;
      }
    }
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
