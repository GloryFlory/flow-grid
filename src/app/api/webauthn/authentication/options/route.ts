/**
 * WebAuthn Authentication Options Endpoint
 * 
 * Generates authentication options for passkey sign-in.
 * Returns challenge and allowed credentials for navigator.credentials.get().
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/normalize-email';
import crypto from 'crypto';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // Rate limiting: 10 requests per minute per email
    const rateLimitKey = `passkey:auth:options:${normalizedEmail}`;
    const rateLimitResult = await rateLimit(rateLimitKey, {
      max: 10,
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

    // Get user's credentials (generic error to prevent enumeration)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        webAuthnCredentials: {
          select: {
            credentialId: true,
            transports: true,
          },
        },
      },
    });

    // Don't reveal if user exists - return empty allowCredentials for non-existent users
    const allowCredentials = user?.webAuthnCredentials.map((cred) => {
      // Parse transports - stored as comma-separated string or null
      let transports: AuthenticatorTransport[] | undefined;
      if (cred.transports) {
        try {
          transports = cred.transports.split(',') as AuthenticatorTransport[];
        } catch {
          transports = undefined;
        }
      }

      return {
        id: Buffer.from(cred.credentialId, 'base64url'),
        type: 'public-key' as const,
        transports,
      };
    }) || [];

    // If user has no passkeys, return an error instead of showing all device passkeys
    if (!user || allowCredentials.length === 0) {
      return NextResponse.json(
        { error: 'No passkeys found for this account. Please use magic link to sign in.' },
        { status: 404 }
      );
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials,
      userVerification: 'preferred',
      timeout: 60000, // 60 seconds
    });

    // Store challenge in Redis with 5-minute TTL
    // Upstash Redis auto-parses JSON, store as object directly (not stringified)
    const challengeKey = `passkey:auth:challenge:${crypto.randomUUID()}`;
    await redis.set(
      challengeKey,
      {
        challenge: options.challenge,
        email: normalizedEmail,
        userId: user.id,
      },
      { ex: 300 } // 5 minutes TTL
    );

    return NextResponse.json(
      {
        options,
        challengeKey,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[Passkey Authentication Options] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
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
