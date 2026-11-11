import { redis } from '../lib/redis.js';
import { config } from '../config/env.js';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  clientId: string,
  batchCount: number
): Promise<RateLimitResult> {
  const currentMinute = Math.floor(Date.now() / 60000);
  const key = `ratelimit:ingest:${clientId}:${currentMinute}`;

  const currentCount = await redis.incrby(key, batchCount);

  if (currentCount === batchCount) {
    await redis.expire(key, 60);
  }

  if (currentCount > config.rateLimitPerMinute) {
    return {
      allowed: false,
      limit: config.rateLimitPerMinute,
      retryAfterSeconds: 60 - (Math.floor(Date.now() / 1000) % 60)
    };
  }

  return { allowed: true, limit: config.rateLimitPerMinute };
}

