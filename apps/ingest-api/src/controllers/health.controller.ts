import type { Request, Response } from 'express';
import { redis } from '../lib/redis.js';

export async function getHealth(_req: Request, res: Response) {
  try {
    const redisPing = await redis.ping();
    res.json({
      status: 'healthy',
      service: 'ingest-api',
      redis: redisPing === 'PONG' ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: (error as Error).message
    });
  }
}

