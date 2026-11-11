import { Redis } from 'ioredis';
import { config } from '../config/env.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  }
});

redis.on('connect', () => {
  console.log('[Redis] Connected to in-memory stream buffer.');
});

redis.on('error', (err) => {
  console.error('[Redis Error]', err.message);
});

