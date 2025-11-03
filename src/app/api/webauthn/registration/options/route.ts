/**
 * WebAuthn Registration Options Endpoint
 * 
 * Generates registration options for creating a new passkey.
 * Returns challenge and RP configuration for navigator.credentials.create().
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import crypto from 'crypto';

const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'Flow Grid';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Get session - user must be authenticated to register a passkey
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase().trim();

    // Rate limiting: 5 requests per 5 minutes per user
    const rateLimitKey = `passkey:reg:options:${email}`;
    const rateLimitResult = await rateLimit(rateLimitKey, {
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

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (!user) {
      // Create user if doesn't exist (shouldn't happen in normal flow)
      user = await prisma.user.create({
        data: {
          email,
          name: session.user.name || email.split('@')[0],
        },
        select: { id: true, name: true },
      });
    }

    // Check existing credentials (for excludeCredentials)
    const existingCredentials = await prisma.webAuthnCredential.findMany({
      where: { userId: user.id },
      select: { credentialId: true },
    });

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: user.id,
      userName: email,
      userDisplayName: user.name || email,
      // Exclude already-registered credentials
      excludeCredentials: existingCredentials.map((cred) => ({
        id: Buffer.from(cred.credentialId, 'base64url'),
        type: 'public-key' as const,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Prefer platform authenticators (Face ID, Touch ID, Windows Hello)
      },
      attestationType: 'none', // We don't need attestation verification
    });

    // Store challenge in Redis with 5-minute TTL
    const challengeKey = `passkey:reg:challenge:${crypto.randomUUID()}`;
    await redis.setex(
      challengeKey,
      300, // 5 minutes
      JSON.stringify({
        challenge: options.challenge,
        userId: user.id,
        email,
      })
    );

    return NextResponse.json(
      {
        options,
        challengeKey, // Client will send this back to verify endpoint
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[Passkey Registration Options] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
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
