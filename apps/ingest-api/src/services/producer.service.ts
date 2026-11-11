import { randomUUID } from 'node:crypto';
import { redis } from '../lib/redis.js';
import { config } from '../config/env.js';
import type { IngestPayload } from '@logpulse/schema';

export async function produceBatch(payload: IngestPayload) {
  const start = performance.now();
  const pipeline = redis.pipeline();
  const receivedAt = new Date().toISOString();

  for (const rawLog of payload.raw_logs) {
    pipeline.xadd(
      config.streamKey,
      'MAXLEN',
      '~',
      String(config.maxStreamLen),
      '*',
      'id', randomUUID(),
      'service_name', payload.service_name,
      'environment', payload.environment,
      'hostname', payload.hostname || 'unknown-host',
      'raw', rawLog,
      'received_at', receivedAt
    );
  }

  await pipeline.exec();

  return {
    streamKey: config.streamKey,
    count: payload.raw_logs.length,
    durationMs: Math.round(performance.now() - start)
  };
}

