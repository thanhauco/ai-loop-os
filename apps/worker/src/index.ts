type RunStatus = "queued" | "running" | "succeeded" | "failed";

interface RunSummary {
  id: string;
  goal: string;
  status: RunStatus;
  qualityScore?: number;
  loops: Array<{ status: string }>;
}

interface MemoryRecord {
  id: string;
  kind: string;
}

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const pollIntervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const runOnce = process.argv.includes("--once");

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Worker request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function summarizeRuns(runs: RunSummary[]): Record<RunStatus, number> {
  return runs.reduce<Record<RunStatus, number>>(
    (summary, run) => {
      summary[run.status] += 1;
      return summary;
    },
    { queued: 0, running: 0, succeeded: 0, failed: 0 }
  );
}

async function tick(): Promise<void> {
  const [runs, memory] = await Promise.all([
    readJson<RunSummary[]>("/api/runs"),
    readJson<MemoryRecord[]>("/api/memory")
  ]);

  const summary = summarizeRuns(runs);
  const latest = runs[0];
  const latestProgress = latest ? `${latest.loops.filter((loop) => loop.status === "passed").length}/${latest.loops.length}` : "0/0";

  console.log(
    JSON.stringify(
      {
        worker: "ai-loop-os-worker",
        apiBaseUrl,
        at: new Date().toISOString(),
        runs: summary,
        memoryRecords: memory.length,
        latestRun: latest
          ? {
              id: latest.id,
              status: latest.status,
              qualityScore: latest.qualityScore ?? null,
              loopProgress: latestProgress,
              goal: latest.goal
            }
          : null
      },
      null,
      2
    )
  );
}

async function main(): Promise<void> {
  console.log(`AI-Loop-OS worker polling ${apiBaseUrl}`);
  await tick();

  if (runOnce) {
    return;
  }

  setInterval(() => {
    void tick().catch((error) => {
      console.error(error instanceof Error ? error.message : error);
    });
  }, pollIntervalMs);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
