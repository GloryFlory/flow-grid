import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { normalizeEmail } from '@/lib/email';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { logError } from '@/lib/log';

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = await request.json();
    const { email } = requestSchema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    /**
     * Rate limit passkey probes to 10 requests per minute per email to avoid enumeration.
     */
    const rateLimitResult = await rateLimit(`has-passkey:${normalizedEmail}`, {
      max: 10,
      windowMs: 60 * 1000, // 10 requests per minute
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

    // Check if user has any passkeys
    const webAuthnCredential = (prisma as any).webAuthnCredential;
    if (!webAuthnCredential) {
      throw new Error('WebAuthn credential delegate is not available on Prisma client.');
    }

    const count = await webAuthnCredential.count({
      where: {
        user: {
          email: normalizedEmail,
        },
      },
    });

    return NextResponse.json(
      { hasPasskey: count > 0 },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logError('Has-passkey probe error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Return false on error to not reveal user enumeration
    return NextResponse.json({ hasPasskey: false });
  }
}
