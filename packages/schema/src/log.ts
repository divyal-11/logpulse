import { z } from 'zod';

export const LogLevelSchema = z.enum([
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
  'UNKNOWN'
]);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const LogFormatSchema = z.enum([
  'RFC5424_SYSLOG',
  'JSON',
  'HDFS',
  'NGINX',
  'APACHE',
  'CUSTOM_TEXT'
]);
export type LogFormat = z.infer<typeof LogFormatSchema>;

/**
 * Raw Log Ingestion Payload (Received by POST /api/v1/ingest)
 */
export const IngestPayloadSchema = z.object({
  service_name: z.string().min(1).max(64),
  environment: z.string().min(1).max(32).default('production'),
  hostname: z.string().max(128).optional().default('unknown-host'),
  raw_logs: z.array(z.string().min(1)).min(1).max(2000), // Max 2,000 logs per batch payload
  metadata: z.record(z.string(), z.unknown()).optional().default({})
});
export type IngestPayload = z.infer<typeof IngestPayloadSchema>;

/**
 * Normalized OpenTelemetry / ECS Compliant Log Schema (Stored in PostgreSQL)
 */
export const NormalizedLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  ingested_at: z.date().default(() => new Date()),
  service_name: z.string().max(64),
  hostname: z.string().max(128).default('unknown-host'),
  level: LogLevelSchema,
  format: LogFormatSchema,
  event_template: z.string().nullable().optional(),
  message: z.string(),
  attributes: z.record(z.string(), z.unknown()).default({}),
  raw: z.string()
});
export type NormalizedLog = z.infer<typeof NormalizedLogSchema>;

