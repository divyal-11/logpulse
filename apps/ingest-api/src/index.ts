import express, { type Express, type Request, type Response } from 'express';
import * as dotenv from 'dotenv';
import { IngestPayloadSchema, REDIS_KEYS } from '@logpulse/schema';

dotenv.config({ path: '../../.env' });

const app: Express = express();
const port = process.env.INGEST_API_PORT || 4000;

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ingest-api',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`[LogPulse Ingest API] Listening on port ${port}`);
});

export default app;

