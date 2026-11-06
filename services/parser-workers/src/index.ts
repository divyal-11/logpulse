import * as dotenv from 'dotenv';
import { REDIS_KEYS } from '@logpulse/schema';
import { checkDatabaseHealth } from '@logpulse/database';

dotenv.config({ path: '../../.env' });

console.log('[LogPulse Parser Worker] Initializing...');

async function run() {
  const dbHealth = await checkDatabaseHealth();
  console.log(`[LogPulse Parser Worker] DB Connection status: ${dbHealth.status} (${dbHealth.latencyMs}ms)`);
  console.log(`[LogPulse Parser Worker] Configured Redis Consumer Group: ${REDIS_KEYS.CONSUMER_GROUP_PARSERS}`);
}

run().catch(console.error);

