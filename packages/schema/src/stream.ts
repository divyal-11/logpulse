import { z } from 'zod';

export const REDIS_KEYS = {
  STREAM_RAW_LOGS: 'stream:logs:raw',
  STREAM_DEAD_LETTER: 'stream:logs:dead-letter',
  CONSUMER_GROUP_PARSERS: 'group:parsers'
} as const;

/**
 * Message payload written to Redis Stream via XADD
 */
export const StreamRawLogPayloadSchema = z.object({
  id: z.string().uuid(),
  service_name: z.string(),
  environment: z.string().default('production'),
  hostname: z.string().default('unknown-host'),
  raw: z.string(),
  received_at: z.string()
});
export type StreamRawLogPayload = z.infer<typeof StreamRawLogPayloadSchema>;

/**
 * Dead-Letter Stream payload for quarantined poison pills
 */
export const StreamDeadLetterPayloadSchema = z.object({
  id: z.string().uuid(),
  raw: z.string(),
  service_name: z.string(),
  error_message: z.string(),
  stack_trace: z.string().optional(),
  delivery_attempts: z.number().default(1),
  quarantined_at: z.string()
});
export type StreamDeadLetterPayload = z.infer<typeof StreamDeadLetterPayloadSchema>;

