import type { Request, Response } from 'express';
import type { IngestPayload } from '@logpulse/schema';
import { checkRateLimit } from '../services/limiter.service.js';
import { produceBatch } from '../services/producer.service.js';

export async function handleIngest(req: Request, res: Response) {
  const start = performance.now();
  const payload = req.body as IngestPayload;
  const clientId = (req.headers['x-forwarded-for'] as string) || req.ip || payload.service_name;

  try {
    const rateCheck = await checkRateLimit(clientId, payload.raw_logs.length);
    if (!rateCheck.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfterSeconds: rateCheck.retryAfterSeconds
      });
      return;
    }

    const batch = await produceBatch(payload);

    res.status(202).json({
      status: 'accepted',
      stream: batch.streamKey,
      ingested_count: batch.count,
      producer_latency_ms: batch.durationMs,
      total_latency_ms: Math.round(performance.now() - start)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Ingestion pipeline error',
      message: (error as Error).message
    });
  }
}

