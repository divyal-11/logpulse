/**
 * LogPulse Benchmark Replay Simulator
 * Sends multi-format log batches into the Ingest API and measures throughput.
 */
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const INGEST_URL = process.env.INGEST_API_URL || 'http://localhost:4000/api/v1/ingest';

const SAMPLE_LOGS = [
  // HDFS Distributed Cluster Logs
  '081109 203518 143 INFO dfs.DataNode$DataXceiver: Receiving block blk_-160899983557502474 src: /10.250.19.102:54106 dest: /10.250.19.102:50010',
  '081109 203519 145 INFO dfs.DataNode$PacketResponder: PacketResponder 1 for block blk_-160899983557502474 terminating',
  '081109 203520 148 INFO dfs.FSNamesystem: BLOCK* NameSystem.addStoredBlock: blockMap updated: 10.250.19.102:50010 is added to blk_-160899983557502474 size 67108864',
  
  // RFC 5424 Syslog
  '<34>1 2026-11-12T01:20:00.003Z worker-node-01 sshd 2412 - - Failed password for invalid user admin from 192.168.1.105 port 42112 ssh2',
  '<30>1 2026-11-12T01:20:01.004Z worker-node-01 sudo 2415 - - pam_unix(sudo:auth): authentication failure; logname= user=root',
  
  // Nginx Access Logs
  '192.168.1.50 - - [12/Nov/2026:01:20:05 +0000] "GET /api/v1/health HTTP/1.1" 200 64 "-" "Go-http-client/1.1"',
  '192.168.1.99 - - [12/Nov/2026:01:20:07 +0000] "POST /api/v1/auth/login HTTP/1.1" 401 128 "-" "Mozilla/5.0"',
  
  // JSON App Logs
  JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    service: 'payment-gateway',
    trace_id: 'tr-9948271',
    message: 'Database connection timeout on pool allocation',
    latency_ms: 5002
  })
];

export async function runSimulation(batchSize = 25, iterations = 4) {
  console.log(`\n🚀 [LogPulse Replay] Starting benchmark stream to: ${INGEST_URL}`);
  console.log(`   Batch size: ${batchSize} logs | Iterations: ${iterations}\n`);

  let totalLogsSent = 0;
  const startTime = performance.now();

  for (let i = 1; i <= iterations; i++) {
    // Pick random samples to assemble batch
    const batchLogs: string[] = [];
    for (let j = 0; j < batchSize; j++) {
      const randomLog = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)];
      batchLogs.push(randomLog);
    }

    const payload = {
      service_name: `benchmark-service-${(i % 3) + 1}`,
      environment: 'staging',
      hostname: `sim-node-0${i}`,
      raw_logs: batchLogs
    };

    const reqStart = performance.now();
    try {
      const res = await fetch(INGEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const latency = Math.round(performance.now() - reqStart);
      const data = await res.json();

      if (res.status === 202) {
        totalLogsSent += batchLogs.length;
        console.log(`  ✓ Batch ${i}/${iterations}: Accepted ${data.ingested_count} logs in ${latency}ms (Gateway: ${data.total_latency_ms}ms)`);
      } else {
        console.warn(`  ⚠ Batch ${i}/${iterations}: Status ${res.status}:`, data);
      }
    } catch (err) {
      console.error(`  ✗ Batch ${i}/${iterations} Connection Failed:`, (err as Error).message);
    }
  }

  const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  const throughput = Math.round(totalLogsSent / Math.max(Number(totalTime), 0.001));

  console.log(`\n📊 [Summary] Sent ${totalLogsSent} logs in ${totalTime}s (~${throughput} logs/sec)`);
}

runSimulation().catch(console.error);
