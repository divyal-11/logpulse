import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  doublePrecision,
  index,
  primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Master Partitioned Table for Normalized Logs
 * Range-partitioned by timestamp in PostgreSQL
 */
export const logsNormalized = pgTable(
  'logs_normalized',
  {
    id: uuid('id').defaultRandom().notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).notNull(),
    ingestedAt: timestamp('ingested_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    serviceName: varchar('service_name', { length: 64 }).notNull(),
    hostname: varchar('hostname', { length: 128 }).default('unknown-host').notNull(),
    level: varchar('level', { length: 16 }).notNull(),
    format: varchar('format', { length: 16 }).notNull(),
    eventTemplate: text('event_template'),
    message: text('message').notNull(),
    attributes: jsonb('attributes').default(sql`'{}'::jsonb`).notNull(),
    raw: text('raw').notNull()
  },
  (table) => [
    primaryKey({ columns: [table.id, table.timestamp] }),
    index('idx_logs_timestamp').on(table.timestamp.desc()),
    index('idx_logs_service_level').on(table.serviceName, table.level),
    index('idx_logs_event_template').on(table.eventTemplate),
    index('idx_logs_attributes_gin').using('gin', table.attributes)
  ]
);

/**
 * Incident Reports Table for LangGraph Autonomous Triage
 */
export const incidentReports = pgTable(
  'incident_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    severity: varchar('severity', { length: 32 }).notNull(),
    status: varchar('status', { length: 32 }).default('TRIAGING').notNull(),
    detectedAt: timestamp('detected_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    anomalyScore: doublePrecision('anomaly_score').notNull(),
    rootCauseSummary: text('root_cause_summary'),
    mitreAttackTechnique: varchar('mitre_attack_technique', { length: 64 }),
    mitigationSteps: text('mitigation_steps').array().default(sql`ARRAY[]::text[]`),
    citedLogIds: uuid('cited_log_ids').array().default(sql`ARRAY[]::uuid[]`),
    approvedBy: varchar('approved_by', { length: 128 }),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index('idx_incident_reports_status').on(table.status),
    index('idx_incident_reports_detected_at').on(table.detectedAt.desc())
  ]
);

export type InsertLog = typeof logsNormalized.$inferInsert;
export type SelectLog = typeof logsNormalized.$inferSelect;
export type InsertIncident = typeof incidentReports.$inferInsert;
export type SelectIncident = typeof incidentReports.$inferSelect;

