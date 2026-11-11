import express, { type Express } from 'express';
import { healthRouter } from './routes/health.routes.js';
import { ingestRouter } from './routes/ingest.routes.js';

export const app: Express = express();

app.use(express.json({ limit: '10mb' }));
app.use(healthRouter);
app.use(ingestRouter);

