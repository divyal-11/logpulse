import { Router } from 'express';
import { validateIngestPayload } from '../middlewares/validate.middleware.js';
import { handleIngest } from '../controllers/ingest.controller.js';

export const ingestRouter: Router = Router();

ingestRouter.post('/api/v1/ingest', validateIngestPayload, handleIngest);

