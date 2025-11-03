/**
 * WebAuthn Passkey Check Endpoint
 * 
 * Enumeration-safe check if an email has registered passkeys.
 * Returns true only if user exists AND has credentials.
 * Does not reveal whether user exists without credentials.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeEmail, isValidEmail } from '@/lib/normalize-email';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting: 30 requests per minute per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `passkey:check:${ip}`;
    const rateLimitResult = await rateLimit(rateLimitKey, {
      max: 30,
      windowMs: 60 * 1000,
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

    const normalizedEmail = normalizeEmail(email);

    // Check if user exists with passkeys
    // Use minimal select to avoid leaking user data
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        webAuthnCredentials: {
          select: { id: true },
          take: 1,
        },
      },
    });

    // Return true only if user exists AND has at least one credential
    const hasPasskey = Boolean(user && user.webAuthnCredentials.length > 0);

    return NextResponse.json(
      { hasPasskey },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[Passkey Check] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check passkey availability' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
