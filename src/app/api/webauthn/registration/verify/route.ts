/**
 * WebAuthn Registration Verify Endpoint
 * 
 * Verifies the attestation response from navigator.credentials.create()
 * and stores the new passkey credential in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Get session - user must be authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { challengeKey, credential } = body;

    if (!challengeKey || !credential) {
      return NextResponse.json(
        { error: 'Missing challengeKey or credential' },
        { status: 400 }
      );
    }

    // Retrieve and consume challenge from Redis
    const challengeDataRaw = await redis.getdel(challengeKey);
    if (!challengeDataRaw) {
      return NextResponse.json(
        { error: 'Challenge expired or invalid' },
        { status: 400 }
      );
    }

    // Upstash Redis with REST API automatically parses JSON
    // so challengeDataRaw is already an object, not a string
    const challengeData = typeof challengeDataRaw === 'string' 
      ? JSON.parse(challengeDataRaw) 
      : challengeDataRaw;
    
    const { challenge, userId, email } = challengeData;

    // Verify session email matches challenge email
    if (email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 403 }
      );
    }

    // Verify the attestation response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    // Store the credential in database
    const storedCredential = await prisma.webAuthnCredential.create({
      data: {
        userId,
        credentialId: Buffer.from(credentialID).toString('base64url'),
        publicKey: Buffer.from(credentialPublicKey),
        counter: BigInt(counter),
        transports: JSON.stringify(credential.response?.transports || []),
      },
    });

    console.log('[Passkey Registration] Success:', {
      userId,
      credentialId: storedCredential.credentialId,
    });

    return NextResponse.json({
      success: true,
      credentialId: storedCredential.credentialId,
    });
  } catch (error) {
    console.error('[Passkey Registration Verify] Error:', error);
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json(
      { error: message },
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
