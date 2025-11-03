import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { verifyRegistration, consumeRegistrationChallenge } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/log';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

const registrationSchema = z.object({
  response: z.any(), // RegistrationResponseJSON
});

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

    // Parse request body
    const body = await request.json();
    const { response } = registrationSchema.parse(body);

    const storedChallenge = await consumeRegistrationChallenge(userId);
    if (!storedChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 400 }
      );
    }

    // Verify registration response
    const verification = await verifyRegistration(
      response as RegistrationResponseJSON,
      storedChallenge
    );

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Save credential to database
    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
    
    const webAuthnCredential = (prisma as any).webAuthnCredential;
    if (!webAuthnCredential) {
      throw new Error('WebAuthn credential delegate is not available on Prisma client.');
    }

    await webAuthnCredential.create({
      data: {
        userId,
        credentialId: Buffer.from(credentialID).toString('base64url'),
        publicKey: Buffer.from(credentialPublicKey),
        counter: BigInt(counter),
        transports: response.response?.transports?.join(','),
      },
    });

    return NextResponse.json({
      verified: true,
      message: 'Passkey registered successfully',
    });
  } catch (error) {
    logError('WebAuthn registration finish error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
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
