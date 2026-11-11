import { app } from './app.js';
import { config } from './config/env.js';

app.listen(config.port, () => {
  console.log(`⚡ [LogPulse Ingest API] Running on http://localhost:${config.port}`);
  console.log(`   - POST /api/v1/ingest (Rate limit: ${config.rateLimitPerMinute} logs/min)`);
  console.log(`   - GET  /health`);
});

