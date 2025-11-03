import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAuthenticationOpts, storeAuthenticationChallenge } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';
import { normalizeEmail } from '@/lib/email';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { logError } from '@/lib/log';

const GENERIC_MESSAGE = "If an account has a passkey, you'll see your device prompt.";

type StoredCredential = {
  credentialId: string;
  transports: string | null;
};

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = await request.json();
    const { email } = requestSchema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    // Rate limiting by email
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip =
      request.headers.get('x-real-ip') ||
      forwardedFor?.split(',')[0]?.trim() ||
      'unknown';

    /**
     * Rate limit authentication starts to 5 attempts per 5 minutes per email/IP pair.
     */
    const rateLimitResult = await rateLimit(`webauthn-auth:${normalizedEmail}:${ip}`, {
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

    // Find user and their credentials
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: GENERIC_MESSAGE },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const webAuthnCredential = (prisma as any).webAuthnCredential;
    if (!webAuthnCredential) {
      throw new Error('WebAuthn credential delegate is not available on Prisma client.');
    }

    const credentials = (await webAuthnCredential.findMany({
      where: { userId: user.id },
      select: {
        credentialId: true,
        transports: true,
      },
    })) as StoredCredential[];

    if (credentials.length === 0) {
      return NextResponse.json(
        { error: GENERIC_MESSAGE },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Generate authentication options
    const formattedCredentials = credentials.map(({ credentialId, transports }) => ({
      credentialId,
      transports: transports ?? undefined,
    }));

    const options = await generateAuthenticationOpts(formattedCredentials);

    const challengeKey = await storeAuthenticationChallenge(user.id, options.challenge);

    return NextResponse.json(
      { 
        options,
        challengeKey, // Send this back to client for finish step
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logError('WebAuthn authentication start error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: GENERIC_MESSAGE },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: GENERIC_MESSAGE },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
