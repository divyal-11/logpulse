import { z } from 'zod';

export const IncidentSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusSchema = z.enum([
  'TRIAGING',
  'AWAITING_APPROVAL',
  'APPROVED',
  'DISMISSED'
]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentReportSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(255),
  severity: IncidentSeveritySchema,
  status: IncidentStatusSchema.default('TRIAGING'),
  detected_at: z.date().default(() => new Date()),
  anomaly_score: z.number(),
  root_cause_summary: z.string().nullable().optional(),
  mitre_attack_technique: z.string().nullable().optional(),
  mitigation_steps: z.array(z.string()).default([]),
  cited_log_ids: z.array(z.string().uuid()).default([]),
  approved_by: z.string().nullable().optional(),
  approved_at: z.date().nullable().optional(),
  created_at: z.date().default(() => new Date())
});
export type IncidentReport = z.infer<typeof IncidentReportSchema>;

/**
 * Stateful LangGraph Incident State Interface
 */
export interface LangGraphIncidentState {
  incident_id: string;
  service_name: string;
  anomaly_timestamp: string;
  anomaly_score: number;
  surrounding_logs: Array<{
    id: string;
    timestamp: string;
    level: string;
    service_name: string;
    message: string;
  }>;
  detected_patterns: string[];
  mitre_attack_technique?: string;
  proposed_mitigation: string[];
  human_approved: boolean;
  analyst_notes?: string;
  final_postmortem?: string;
}

