/**
 * WebAuthn utility functions for passkey registration and authentication
 */

import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransport,
} from '@simplewebauthn/types';
import { Redis } from '@upstash/redis';
import type { Redis as UpstashRedis } from '@upstash/redis';
import { randomUUID } from 'crypto';

export const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
export const rpName = process.env.WEBAUTHN_RP_NAME || 'Flow Grid';
export const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const CHALLENGE_TTL_SECONDS = 60 * 5; // 5 minutes
const REGISTRATION_PREFIX = 'webauthn:reg';
const AUTHENTICATION_PREFIX = 'webauthn:auth';

type RedisClient = UpstashRedis;

declare global {
  // eslint-disable-next-line no-var
  var __flowgridRedis: RedisClient | undefined;
}

function getRedisClient(): RedisClient {
  if (globalThis.__flowgridRedis) {
    return globalThis.__flowgridRedis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Upstash Redis environment variables are not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    );
  }

  const client = new Redis({ url, token });
  globalThis.__flowgridRedis = client;
  return client;
}

const registrationKey = (userId: string) => `${REGISTRATION_PREFIX}:${userId}`;
const authenticationKey = (userId: string, challengeId: string) => `${AUTHENTICATION_PREFIX}:${userId}:${challengeId}`;

interface RegistrationChallengePayload {
  challenge: string;
}

interface AuthenticationChallengePayload {
  challenge: string;
}

export async function storeRegistrationChallenge(userId: string, challenge: string): Promise<void> {
  const redis = getRedisClient();
  await redis.set(registrationKey(userId), { challenge }, {
    ex: CHALLENGE_TTL_SECONDS,
  });
}

export async function consumeRegistrationChallenge(userId: string): Promise<string | null> {
  const redis = getRedisClient();
  const key = registrationKey(userId);
  const raw = await redis.get<RegistrationChallengePayload>(key);

  if (!raw) {
    return null;
  }

  await redis.del(key);
  return raw.challenge;
}

export async function storeAuthenticationChallenge(userId: string, challenge: string): Promise<string> {
  const redis = getRedisClient();
  const challengeId = randomUUID();
  const key = authenticationKey(userId, challengeId);

  await redis.set(key, { challenge }, {
    ex: CHALLENGE_TTL_SECONDS,
  });

  return `${userId}:${challengeId}`;
}

export async function consumeAuthenticationChallenge(challengeKey: string): Promise<{
  challenge: string;
  userId: string;
} | null> {
  const [userId, challengeId] = challengeKey.split(':');

  if (!userId || !challengeId) {
    return null;
  }

  const redis = getRedisClient();
  const key = authenticationKey(userId, challengeId);
  const raw = await redis.get<AuthenticationChallengePayload>(key);

  if (!raw) {
    return null;
  }

  await redis.del(key);
  return { challenge: raw.challenge, userId };
}

export { getRedisClient };

export interface WebAuthnCredentialData {
  credentialId: string;
  publicKey: Buffer;
  counter: number;
  transports?: string;
}

/**
 * Generate options for credential registration
 */
export async function generateRegistrationOpts(userId: string, userName: string, userEmail: string) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userID: userId,
    userName: userEmail,
    userDisplayName: userName || userEmail,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required',
      authenticatorAttachment: 'platform',
    },
  });
}

/**
 * Verify registration response from the client
 */
export async function verifyRegistration(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
}

/**
 * Generate options for authentication
 */
export async function generateAuthenticationOpts(
  credentials: Array<{ credentialId: string; transports?: string }>
) {
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials.map((cred) => ({
      id: Buffer.from(cred.credentialId, 'base64url'),
      type: 'public-key' as const,
      transports: (cred.transports?.split(',') || []) as AuthenticatorTransport[],
    })),
    userVerification: 'required',
  });
}

/**
 * Verify authentication response from the client
 */
export async function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  credential: {
    credentialId: string;
    publicKey: Buffer;
    counter: number;
  }
): Promise<VerifiedAuthenticationResponse> {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(credential.credentialId, 'base64url'),
      credentialPublicKey: credential.publicKey,
      counter: Number(credential.counter),
    },
  });
}
