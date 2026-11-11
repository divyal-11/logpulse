import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  port: Number(process.env.INGEST_API_PORT) || 4000,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rateLimitPerMinute: Number(process.env.INGEST_RATE_LIMIT_PER_MINUTE) || 5000,
  streamKey: process.env.REDIS_STREAM_RAW || 'stream:logs:raw',
  maxStreamLen: 1_000_000
} as const;

