import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthentication, consumeAuthenticationChallenge } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/log';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

type CredentialRecord = {
  id: string;
  credentialId: string;
  publicKey: Buffer;
  counter: bigint;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

const authenticationSchema = z.object({
  response: z.any(), // AuthenticationResponseJSON
  challengeKey: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = await request.json();
    const { response, challengeKey } = authenticationSchema.parse(body);

    // Get stored challenge
    const storedChallenge = await consumeAuthenticationChallenge(challengeKey);
    if (!storedChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 400 }
      );
    }

    // Find credential
    const credentialId = Buffer.from(
      (response as AuthenticationResponseJSON).rawId,
      'base64url'
    ).toString('base64url');

    const webAuthnCredential = (prisma as any).webAuthnCredential;
    if (!webAuthnCredential) {
      throw new Error('WebAuthn credential delegate is not available on Prisma client.');
    }

    const credential = (await webAuthnCredential.findUnique({
      where: { credentialId },
      include: { user: true },
    })) as CredentialRecord | null;

    if (!credential || credential.user.id !== storedChallenge.userId) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 400 }
      );
    }

    // Verify authentication response
    const verification = await verifyAuthentication(
      response as AuthenticationResponseJSON,
      storedChallenge.challenge,
      {
        credentialId,
        publicKey: credential.publicKey,
        counter: Number(credential.counter),
      }
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Update counter and last used timestamp
    await webAuthnCredential.update({
      where: { id: credential.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    // Return success with user info for client-side session creation
    return NextResponse.json({
      verified: true,
      user: {
        id: credential.user.id,
        email: credential.user.email,
        name: credential.user.name,
      },
    });
  } catch (error) {
    logError('WebAuthn authentication finish error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
