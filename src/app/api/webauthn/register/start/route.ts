import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateRegistrationOpts, storeRegistrationChallenge } from '@/lib/webauthn';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { logError } from '@/lib/log';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip =
      request.headers.get('x-real-ip') ||
      forwardedFor?.split(',')[0]?.trim() ||
      'unknown';

    /**
     * Rate limit registration starts to 5 attempts per 5 minutes per user/IP pair.
     */
    const rateLimitResult = await rateLimit(`webauthn-register:${userId}:${ip}`, {
      max: 5,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Generate registration options
    const options = await generateRegistrationOpts(
      userId,
      session.user.name || session.user.email,
      session.user.email
    );

    await storeRegistrationChallenge(userId, options.challenge);

    return NextResponse.json(
      { options },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logError('WebAuthn registration start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
