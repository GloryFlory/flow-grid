import { Ratelimit } from '@upstash/ratelimit';
import type { Ratelimit as UpstashRatelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { Redis as UpstashRedis } from '@upstash/redis';

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  max: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

type RedisClient = UpstashRedis;
type LimiterInstance = UpstashRatelimit;

declare global {
  // eslint-disable-next-line no-var
  var __flowgridRedis: RedisClient | undefined;
  // eslint-disable-next-line no-var
  var __flowgridLimiterCache: Map<string, LimiterInstance> | undefined;
}

function getRedisClient(): RedisClient {
  if (globalThis.__flowgridRedis) {
    return globalThis.__flowgridRedis;
  }

  // Try to get credentials from environment first
  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // FALLBACK for local development (remove these after env loading is fixed)
  if (!url || url === 'PASTE_YOUR_URL_HERE' || url.includes('PASTE')) {
    console.warn('[Rate Limit] Using hardcoded fallback credentials (local dev only)');
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

function getLimiter(config: RateLimitConfig): LimiterInstance {
  const cache = globalThis.__flowgridLimiterCache ?? new Map<string, LimiterInstance>();
  if (!globalThis.__flowgridLimiterCache) {
    globalThis.__flowgridLimiterCache = cache;
  }

  const key = `${config.max}:${config.windowMs}`;
  const existing = cache.get(key);

  if (existing) {
    return existing;
  }

  const windowSeconds = Math.ceil(config.windowMs / 1000);
  const limiter = new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(config.max, `${windowSeconds} s`),
    prefix: 'ratelimit',
  });

  cache.set(key, limiter);
  return limiter;
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { max: 5, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  const limiter = getLimiter(config);
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset * 1000,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}
