# LogPulse ⚡
### Universal Log Pre-processing & Stream Anomaly Detection Platform
*High-throughput telemetry ingestion pipeline, real-time multivariate anomaly detection, and autonomous incident triage.*

---

## 🚀 Overview

**LogPulse** is a distributed, high-throughput log pre-processing framework and real-time security analytics platform inspired by **SIH26156 (NTRO)** and **SIH26157 (SOC Assessment)**. 

It solves the enterprise logging crisis: fragmented log formats (Syslog, JSON, HDFS), database write-saturation bottlenecks, and silent system failures.

### Key Capabilities
- **High-Throughput Ingestion:** Fast async HTTP gateway streaming into **Redis Streams** with consumer-group backpressure handling.
- **Universal Normalization:** TypeScript worker pool parsing multi-vendor logs into an **OpenTelemetry/ECS-compliant schema**.
- **Tiered Storage Architecture:** Micro-batched inserts into **Time-Partitioned PostgreSQL** (Hot Tier) and compressed archiving to **MinIO/S3** (Cold Tier).
- **ML Anomaly Engine:** **Isolation Forest** trained on the academic **LogHub** benchmark to detect multivariate event sequence anomalies beyond simple error thresholds.
- **Autonomous Incident Triage (LangGraph):** Multi-step agentic triage workflow featuring read-only SQL diagnostic querying, MITRE ATT&CK correlation, and human-in-the-loop review.
- **Modern Command Center:** **Next.js 15** dashboard with virtualized infinite log streaming (`@tanstack/react-virtual`).

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, TanStack Virtual
- **Streaming & Buffer:** Redis 7 (Redis Streams, Consumer Groups, PEL recovery)
- **Background Workers:** Node.js, TypeScript, ioredis
- **Database & Storage:** PostgreSQL 16 (Range Partitioning, JSONB GIN Indexing), MinIO / S3
- **Machine Learning:** Python, Scikit-learn (Isolation Forest), Drain3 template parser
- **Agentic AI:** LangGraph, LangChain (Read-only SQL diagnostic tools, human-in-the-loop)
- **DevOps:** Docker, Docker Compose, GitHub Actions

---

## 📂 Project Structure

```
logpulse/
├── apps/
│   ├── web/               # Next.js 15 Command Center Dashboard
│   ├── ingest-api/        # High-speed log ingestion HTTP gateway
├── services/
│   ├── parser-workers/    # TypeScript workers consuming from Redis Streams
│   ├── anomaly-detector/  # Python service running Isolation Forest
│   └── triage-agent/      # LangGraph stateful incident triage workflow
├── packages/
│   ├── schema/            # Shared OpenTelemetry/ECS TypeScript interfaces
│   ├── database/          # Drizzle ORM schema & partitioned migrations
├── docker/
│   └── docker-compose.yml # PostgreSQL, Redis, MinIO infrastructure
└── scripts/
    └── replay-logs.ts     # LogHub streaming simulator for benchmark testing
```

---

## 📜 License
MIT
