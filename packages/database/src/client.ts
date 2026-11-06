import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const adminConnectionString =
  process.env.DATABASE_URL ||
  'postgresql://logpulse_admin:logpulse_secure_password@localhost:5432/logpulse';

const readOnlyConnectionString =
  process.env.DATABASE_RO_URL ||
  'postgresql://logpulse_agent_readonly:agent_readonly_pass@localhost:5432/logpulse';

/**
 * High-performance write & operational pool for backend ingestion and parser workers
 */
export const adminPool = new Pool({
  connectionString: adminConnectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export const db = drizzle(adminPool, { schema });

/**
 * Restricted read-only pool for the LangGraph Autonomous Incident Triage Agent.
 * Enforces session timeout and SELECT-only security bounds.
 */
export const readOnlyPool = new Pool({
  connectionString: readOnlyConnectionString,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 3000,
  statement_timeout: 2000 // 2-second hard ceiling per query
});

export const dbReadOnly = drizzle(readOnlyPool, { schema });

/**
 * Health check helper for database connections
 */
export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }> {
  const start = Date.now();
  try {
    await adminPool.query('SELECT 1');
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (error) {
    return { status: 'unhealthy', latencyMs: Date.now() - start };
  }
}

