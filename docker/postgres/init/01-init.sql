-- ============================================================================
-- LogPulse Database Initialization Script
-- PostgreSQL 16 Partitioned Schema & Security Sandbox
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Master Partitioned Table (Range Partitioned by timestamp)
CREATE TABLE IF NOT EXISTS logs_normalized (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service_name VARCHAR(64) NOT NULL,
    hostname VARCHAR(128) NOT NULL DEFAULT 'unknown-host',
    level VARCHAR(16) NOT NULL,
    format VARCHAR(16) NOT NULL,
    event_template TEXT,                -- Extracted signature (e.g., "Receiving block <*> src: <*>", Drain3 template)
    message TEXT NOT NULL,              -- Sanitized / normalized message text
    attributes JSONB DEFAULT '{}'::jsonb, -- Key-value extracted variables (IP, user_id, status_code)
    raw TEXT NOT NULL,                  -- Lossless original log representation (SIH compliance)
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- 3. Default Catch-All Partition (Prevents drops if timestamps fall outside pre-allocated windows)
CREATE TABLE IF NOT EXISTS logs_p_default PARTITION OF logs_normalized DEFAULT;

-- 4. Initial Daily Partitions (Covering benchmark replay & immediate operational window)
-- Standard partitions for year 2026 test and production windows:
DO $$
DECLARE
    curr_date DATE := CURRENT_DATE;
    partition_date DATE;
    partition_name TEXT;
    start_ts TEXT;
    end_ts TEXT;
BEGIN
    -- Create partitions for 7 days in the past through 7 days in the future
    FOR i IN -7..7 LOOP
        partition_date := curr_date + i;
        partition_name := 'logs_p_' || TO_CHAR(partition_date, 'YYYY_MM_DD');
        start_ts := TO_CHAR(partition_date, 'YYYY-MM-DD 00:00:00+00');
        end_ts := TO_CHAR(partition_date + 1, 'YYYY-MM-DD 00:00:00+00');

        BEGIN
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS %I PARTITION OF logs_normalized FOR VALUES FROM (%L) TO (%L)',
                partition_name, start_ts, end_ts
            );
        EXCEPTION WHEN duplicate_table THEN
            NULL;
        END;
    END LOOP;
END $$;

-- 5. High-Performance Composite & GIN Indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_normalized (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_service_level ON logs_normalized (service_name, level);
CREATE INDEX IF NOT EXISTS idx_logs_event_template ON logs_normalized (event_template);
CREATE INDEX IF NOT EXISTS idx_logs_attributes_gin ON logs_normalized USING GIN (attributes);

-- 6. Dedicated Incident Triage Table (For LangGraph State Machine & SOC Review)
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(32) NOT NULL,       -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(32) NOT NULL DEFAULT 'TRIAGING', -- TRIAGING, AWAITING_APPROVAL, APPROVED, DISMISSED
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    anomaly_score DOUBLE PRECISION NOT NULL,
    root_cause_summary TEXT,
    mitre_attack_technique VARCHAR(64),
    mitigation_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
    cited_log_ids UUID[] DEFAULT ARRAY[]::UUID[],
    approved_by VARCHAR(128),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports (status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_detected_at ON incident_reports (detected_at DESC);

-- 7. Autonomous AI Security Role: Read-Only Sandbox for LangGraph Agent
-- Strictly prevents DDL/DML, prompt injections (DROP/DELETE), and bounds execution time to 2 seconds.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'logpulse_agent_readonly') THEN
        CREATE ROLE logpulse_agent_readonly WITH LOGIN PASSWORD 'agent_readonly_pass';
    END IF;
END $$;

GRANT CONNECT ON DATABASE logpulse TO logpulse_agent_readonly;
GRANT USAGE ON SCHEMA public TO logpulse_agent_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO logpulse_agent_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO logpulse_agent_readonly;

-- Enforce strict session query timeout (2000ms = 2s)
ALTER ROLE logpulse_agent_readonly SET statement_timeout = '2000';

