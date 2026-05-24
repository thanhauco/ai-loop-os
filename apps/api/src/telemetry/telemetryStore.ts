import type { LoopName, Run, RunStatus } from "../types.js";

export interface TelemetryEvent {
  id: number;
  type: "run_created" | "run_updated" | "loop_started" | "loop_completed" | "approval_wait" | "run_completed" | "run_failed";
  runId: string;
  loopName?: LoopName;
  runStatus: RunStatus;
  at: number;
  data?: Record<string, unknown>;
}

export class TelemetryStore {
  private readonly events: TelemetryEvent[] = [];
  private nextId = 1;

  record(event: Omit<TelemetryEvent, "id" | "at"> & { at?: number }): TelemetryEvent {
    const saved = {
      ...event,
      id: this.nextId,
      at: event.at ?? Date.now()
    } satisfies TelemetryEvent;

    this.nextId += 1;
    this.events.unshift(saved);
    this.events.splice(500);
    return saved;
  }

  list(limit = 100): TelemetryEvent[] {
    return this.events.slice(0, limit);
  }

  prometheus(runs: Run[]): string {
    const totalRuns = runs.length;
    const byStatus = runs.reduce<Record<string, number>>((summary, run) => {
      summary[run.status] = (summary[run.status] ?? 0) + 1;
      return summary;
    }, {});
    const completedLoops = runs.reduce((sum, run) => sum + run.loops.filter((loop) => loop.status === "passed").length, 0);
    const awaitingApproval = runs.filter((run) => run.status === "awaiting_approval").length;

    const lines = [
      "# HELP ai_loop_os_runs_total Total runs observed by the API.",
      "# TYPE ai_loop_os_runs_total gauge",
      `ai_loop_os_runs_total ${totalRuns}`,
      "# HELP ai_loop_os_runs_by_status Runs by current status.",
      "# TYPE ai_loop_os_runs_by_status gauge",
      ...Object.entries(byStatus).map(([status, count]) => `ai_loop_os_runs_by_status{status=\"${status}\"} ${count}`),
      "# HELP ai_loop_os_completed_loops_total Completed loop records across retained runs.",
      "# TYPE ai_loop_os_completed_loops_total gauge",
      `ai_loop_os_completed_loops_total ${completedLoops}`,
      "# HELP ai_loop_os_awaiting_approval_total Runs currently awaiting human approval.",
      "# TYPE ai_loop_os_awaiting_approval_total gauge",
      `ai_loop_os_awaiting_approval_total ${awaitingApproval}`,
      "# HELP ai_loop_os_telemetry_events_total Telemetry events retained in memory.",
      "# TYPE ai_loop_os_telemetry_events_total gauge",
      `ai_loop_os_telemetry_events_total ${this.events.length}`
    ];

    return `${lines.join("\n")}\n`;
  }
}
