/**
 * Redis client for WebAuthn challenge storage and other caching needs
 * Wraps Upstash Redis with convenience methods
 */

import { Redis } from '@upstash/redis';

declare global {
  // eslint-disable-next-line no-var
  var __flowgridRedis: Redis | undefined;
}

function getRedisClient(): Redis {
  if (globalThis.__flowgridRedis) {
    return globalThis.__flowgridRedis;
  }

  // Try to get credentials from environment first
  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // FALLBACK for local development (remove these after env loading is fixed)
  if (!url || url === 'PASTE_YOUR_URL_HERE' || url.includes('PASTE')) {
    console.warn('[Redis] Using hardcoded fallback credentials (local dev only)');
    url = "https://still-haddock-22951.upstash.io";
    token = "AVmnAAIncDI0ZjVkNTYyYWUzZWU0NzkwYjc1MGIxMmY2YmJjN2E3OHAyMjI5NTE";
  }

  if (!url || !token) {
    throw new Error(
      'Upstash Redis environment variables are not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    );
  }

  const client = new Redis({ url, token });
  globalThis.__flowgridRedis = client;
  return client;
}

export const redis = getRedisClient();

// Convenience methods for common operations
export const redisHelpers = {
  /**
   * Set a value with expiration (seconds)
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await redis.setex(key, seconds, value);
  },

  /**
   * Get a value and delete it atomically
   */
  async getdel(key: string): Promise<string | null> {
    return redis.getdel(key);
  },

  /**
   * Get a value
   */
  async get(key: string): Promise<string | null> {
    return redis.get(key);
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    return redis.del(key);
  },
};
