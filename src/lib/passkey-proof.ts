/**
 * Single-use passkey proof tokens.
 *
 * When a passkey assertion is verified server-side, we mint a short-lived,
 * single-use token bound to the user's email and hand it to the client.
 * The NextAuth credentials provider then requires this token to establish a
 * session. This closes the auth-bypass hole where the client could simply
 * assert `passkeyVerified: 'true'` with no server-side proof.
 */

import { redis } from '@/lib/redis';
import { randomUUID } from 'crypto';

const PROOF_PREFIX = 'webauthn:proof';
const PROOF_TTL_SECONDS = 120; // 2 minutes — long enough to round-trip signIn()

/**
 * Issue a single-use proof token for a verified passkey authentication.
 * @param email - The (already verified) user's email
 * @returns an opaque token to be handed to the client
 */
export async function issuePasskeyProof(email: string): Promise<string> {
  const token = randomUUID();
  await redis.set(`${PROOF_PREFIX}:${token}`, email, { ex: PROOF_TTL_SECONDS });
  return token;
}

/**
 * Atomically consume a proof token, returning the email it was issued for.
 * Uses GETDEL so a token can only ever be redeemed once.
 * @returns the email bound to the token, or null if missing/expired/invalid
 */
export async function consumePasskeyProof(token: unknown): Promise<string | null> {
  if (!token || typeof token !== 'string') return null;
  const value = await redis.getdel(`${PROOF_PREFIX}:${token}`);
  return typeof value === 'string' ? value : null;
}
