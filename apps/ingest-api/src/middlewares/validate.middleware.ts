import type { Request, Response, NextFunction } from 'express';
import { IngestPayloadSchema } from '@logpulse/schema';

export function validateIngestPayload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = IngestPayloadSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: 'Invalid log payload format',
      issues: result.error.issues
    });
    return;
  }

  req.body = result.data;
  next();
}

