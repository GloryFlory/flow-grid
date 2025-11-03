/**
 * WebAuthn Authentication Verify Endpoint
 * 
 * Verifies the assertion response from navigator.credentials.get()
 * and establishes a session for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { signIn } from 'next-auth/react';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
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

    // Upstash Redis auto-parses JSON, so challengeDataRaw is already an object
    const challengeData = challengeDataRaw as { challenge: string; email: string; userId: string };
    const { challenge, email, userId } = challengeData;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the credential from database
    const credentialId = (credential as AuthenticationResponseJSON).id;
    const storedCredential = await prisma.webAuthnCredential.findFirst({
      where: {
        credentialId: credentialId,
        userId: userId,
      },
    });

    if (!storedCredential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      );
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential as AuthenticationResponseJSON,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: Buffer.from(storedCredential.credentialId, 'base64url'),
        credentialPublicKey: storedCredential.publicKey,
        counter: Number(storedCredential.counter),
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Update counter and last used timestamp
    await prisma.webAuthnCredential.update({
      where: { id: storedCredential.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[Passkey Authentication] Success:', {
      userId,
      credentialId: storedCredential.credentialId,
    });

    // Return success - client will handle session creation via NextAuth
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('[Passkey Authentication Verify] Error:', error);
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
