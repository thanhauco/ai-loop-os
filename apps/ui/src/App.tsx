import { Activity, BrainCircuit, CheckCircle2, Clock3, Database, FileText, Play, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type LoopStatus = "pending" | "running" | "passed" | "failed" | "skipped";
type RunStatus = "queued" | "running" | "succeeded" | "failed";

type LoopRecord = {
  name: string;
  title: string;
  status: LoopStatus;
  startedAt?: number;
  finishedAt?: number;
  summary?: string;
  output?: Record<string, unknown>;
  logs: string[];
};

type Run = {
  id: string;
  goal: string;
  status: RunStatus;
  createdAt: number;
  updatedAt: number;
  compliance: string[];
  maxRetries: number;
  loops: LoopRecord[];
  artifacts: Record<string, unknown>;
  qualityScore?: number;
};

type MemoryRecord = {
  id: string;
  kind: "episodic" | "semantic" | "procedural";
  runId: string;
  data: Record<string, unknown>;
  createdAt: number;
};

const frameworks = ["SOC2", "HIPAA", "GDPR", "PCI-DSS", "ISO27001"];
const defaultGoal = "Build a HIPAA-compliant hospital chatbot that can research policies, generate code, verify facts, and prepare deployment evidence.";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function statusIcon(status: LoopStatus | RunStatus) {
  if (status === "running" || status === "queued") {
    return <RefreshCw className="spin" size={16} aria-hidden="true" />;
  }

  if (status === "passed" || status === "succeeded") {
    return <CheckCircle2 size={16} aria-hidden="true" />;
  }

  if (status === "failed") {
    return <TriangleAlert size={16} aria-hidden="true" />;
  }

  return <Clock3 size={16} aria-hidden="true" />;
}

function formatTime(value?: number) {
  if (!value) {
    return "pending";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(value);
}

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="json-block">{JSON.stringify(value, null, 2)}</pre>;
}

function App() {
  const [goal, setGoal] = useState(defaultGoal);
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>(["HIPAA", "SOC2"]);
  const [maxRetries, setMaxRetries] = useState(2);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [memory, setMemory] = useState<MemoryRecord[]>([]);
  const [selectedLoop, setSelectedLoop] = useState<string>("planner");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentLoop = useMemo(
    () => activeRun?.loops.find((loop) => loop.name === selectedLoop) ?? activeRun?.loops[0],
    [activeRun, selectedLoop]
  );

  const completedLoops = activeRun?.loops.filter((loop) => loop.status === "passed").length ?? 0;
  const totalLoops = activeRun?.loops.length ?? 0;
  const progress = totalLoops ? Math.round((completedLoops / totalLoops) * 100) : 0;

  async function refresh(runId?: string) {
    const [nextRuns, nextMemory] = await Promise.all([
      api<Run[]>("/api/runs"),
      api<MemoryRecord[]>("/api/memory")
    ]);
    setRuns(nextRuns);
    setMemory(nextMemory);

    if (runId) {
      const nextRun = await api<Run>(`/api/runs/${runId}`);
      setActiveRun(nextRun);
      setSelectedLoop((previous) => nextRun.loops.some((loop) => loop.name === previous) ? previous : nextRun.loops[0]?.name ?? "planner");
    } else if (!activeRun && nextRuns[0]) {
      setActiveRun(nextRuns[0]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!activeRun || !["queued", "running"].includes(activeRun.status)) {
      return;
    }

    const events = new EventSource(`/api/runs/${activeRun.id}/events`);

    events.addEventListener("run", (event) => {
      const nextRun = JSON.parse(event.data) as Run;
      setActiveRun(nextRun);
      setRuns((current) => {
        const withoutRun = current.filter((run) => run.id !== nextRun.id);
        return [nextRun, ...withoutRun].sort((left, right) => right.createdAt - left.createdAt);
      });
      setSelectedLoop((previous) => nextRun.loops.some((loop) => loop.name === previous) ? previous : nextRun.loops[0]?.name ?? "planner");

      if (!["queued", "running"].includes(nextRun.status)) {
        void refresh(nextRun.id).catch((caught) => setError(caught instanceof Error ? caught.message : "Refresh failed"));
        events.close();
      }
    });

    events.onerror = () => {
      events.close();
      void refresh(activeRun.id).catch((caught) => setError(caught instanceof Error ? caught.message : "Refresh failed"));
    };

    return () => events.close();
  }, [activeRun?.id, activeRun?.status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const run = await api<Run>("/api/runs", {
        method: "POST",
        body: JSON.stringify({ goal, compliance: selectedCompliance, maxRetries })
      });
      setActiveRun(run);
      setSelectedLoop(run.loops[0]?.name ?? "planner");
      await refresh(run.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Run submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCompliance(framework: string) {
    setSelectedCompliance((current) =>
      current.includes(framework)
        ? current.filter((item) => item !== framework)
        : [...current, framework]
    );
  }

  return (
    <main className="shell">
      <section className="topbar" aria-label="AI-Loop-OS overview">
        <div>
          <p className="eyebrow">Autonomous engineering runtime</p>
          <h1>AI-Loop-OS</h1>
        </div>
        <div className={`run-status ${activeRun?.status ?? "queued"}`}>
          {statusIcon(activeRun?.status ?? "queued")}
          <span>{activeRun?.status ?? "ready"}</span>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="control-panel" onSubmit={submit}>
          <div className="panel-heading">
            <BrainCircuit size={20} aria-hidden="true" />
            <h2>Objective</h2>
          </div>

          <label className="field">
            <span>Goal</span>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={6} />
          </label>

          <fieldset className="frameworks">
            <legend>Compliance</legend>
            <div className="toggle-grid">
              {frameworks.map((framework) => (
                <label key={framework} className="toggle">
                  <input
                    type="checkbox"
                    checked={selectedCompliance.includes(framework)}
                    onChange={() => toggleCompliance(framework)}
                  />
                  <span>{framework}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field compact">
            <span>Retry budget</span>
            <input
              type="number"
              min={0}
              max={5}
              value={maxRetries}
              onChange={(event) => setMaxRetries(Number(event.target.value))}
            />
          </label>

          <button className="primary-button" type="submit" disabled={submitting || !goal.trim()} title="Start autonomous run">
            <Play size={17} aria-hidden="true" />
            <span>{submitting ? "Starting" : "Start run"}</span>
          </button>

          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <section className="run-panel" aria-label="Run progress">
          <div className="panel-heading spread">
            <div>
              <div className="inline-title">
                <Activity size={20} aria-hidden="true" />
                <h2>Loop Runtime</h2>
              </div>
              <p>{activeRun ? activeRun.goal : "No run yet"}</p>
            </div>
            <div className="score-box">
              <span>Quality</span>
              <strong>{activeRun?.qualityScore ?? "--"}</strong>
            </div>
          </div>

          <div className="progress-track" aria-label="Loop progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="loop-grid">
            {activeRun?.loops.map((loop) => (
              <button
                key={loop.name}
                className={`loop-card ${loop.status} ${selectedLoop === loop.name ? "selected" : ""}`}
                type="button"
                onClick={() => setSelectedLoop(loop.name)}
                title={`Open ${loop.title}`}
              >
                <span className="loop-card-status">{statusIcon(loop.status)}</span>
                <span>
                  <strong>{loop.title}</strong>
                  <small>{loop.summary ?? loop.status}</small>
                </span>
              </button>
            )) ?? <p className="empty-state">Start a run to initialize the loop graph.</p>}
          </div>
        </section>
      </section>

      <section className="detail-grid">
        <article className="detail-panel">
          <div className="panel-heading spread">
            <div className="inline-title">
              <FileText size={20} aria-hidden="true" />
              <h2>{currentLoop?.title ?? "Loop Detail"}</h2>
            </div>
            <span className={`status-pill ${currentLoop?.status ?? "pending"}`}>{currentLoop?.status ?? "pending"}</span>
          </div>
          <p className="summary-text">{currentLoop?.summary ?? "Waiting for loop output."}</p>
          <div className="time-row">
            <span>Started {formatTime(currentLoop?.startedAt)}</span>
            <span>Finished {formatTime(currentLoop?.finishedAt)}</span>
          </div>
          {currentLoop?.output ? <JsonBlock value={currentLoop.output} /> : null}
        </article>

        <article className="detail-panel">
          <div className="panel-heading">
            <Database size={20} aria-hidden="true" />
            <h2>Memory</h2>
          </div>
          <div className="memory-list">
            {memory.slice(0, 6).map((record) => (
              <div className="memory-item" key={record.id}>
                <span className={`memory-kind ${record.kind}`}>{record.kind}</span>
                <JsonBlock value={record.data} />
              </div>
            ))}
            {!memory.length ? <p className="empty-state">Memory records appear after a run reaches the memory loop.</p> : null}
          </div>
        </article>

        <article className="detail-panel wide">
          <div className="panel-heading">
            <ShieldCheck size={20} aria-hidden="true" />
            <h2>Artifacts</h2>
          </div>
          {activeRun ? <JsonBlock value={activeRun.artifacts} /> : <p className="empty-state">Run artifacts will be collected here.</p>}
        </article>

        <article className="detail-panel runs-panel">
          <div className="panel-heading">
            <Clock3 size={20} aria-hidden="true" />
            <h2>Recent Runs</h2>
          </div>
          <div className="run-list">
            {runs.map((run) => (
              <button key={run.id} type="button" onClick={() => void refresh(run.id)} className="run-row" title="Open run">
                <span>{statusIcon(run.status)}</span>
                <strong>{run.goal}</strong>
                <small>{formatTime(run.createdAt)}</small>
              </button>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
