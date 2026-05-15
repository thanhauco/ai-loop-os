import { loopRegistry } from "./loops/registry.js";
import type { LlmProvider, LoopName, MemoryStore, RunContext } from "./types.js";
import type { RunStore } from "./stores/runStore.js";
import type { Run } from "./types.js";

const loopPauseMs = 140;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Orchestrator {
  constructor(
    private readonly runs: RunStore,
    private readonly memory: MemoryStore,
    private readonly llm: LlmProvider,
    private readonly onRunUpdated?: (run: Run) => void
  ) {}

  async execute(runId: string): Promise<void> {
    const run = this.runs.get(runId);

    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    run.status = "running";
    this.save(run);

    const emit: RunContext["emit"] = (loopName: LoopName, line: string) => {
      const loop = run.loops.find((candidate) => candidate.name === loopName);
      if (!loop) {
        return;
      }

      loop.logs.push(`${new Date().toISOString()} ${line}`);
      this.save(run);
    };

    const context = {
      run,
      emit,
      memory: this.memory,
      llm: this.llm
    } satisfies RunContext;

    try {
      for (const loop of run.loops) {
        const definition = loopRegistry.find((candidate) => candidate.name === loop.name);
        if (!definition || loop.status === "passed" || loop.status === "skipped") {
          continue;
        }

        if (definition.name === "human_approval" && run.approval.status === "pending") {
          loop.status = "running";
          loop.startedAt ??= Date.now();
          loop.summary = "Awaiting human approval before continuing.";
          loop.output = {
            status: run.approval.status,
            gates: run.approval.gates,
            requestedAt: run.approval.requestedAt ?? null
          };
          run.status = "awaiting_approval";
          run.artifacts[definition.name] = loop.output;
          this.save(run);
          return;
        }

        if (definition.name === "human_approval" && run.approval.status === "rejected") {
          loop.status = "failed";
          loop.finishedAt = Date.now();
          loop.summary = "Human approval was rejected.";
          loop.output = {
            status: run.approval.status,
            gates: run.approval.gates,
            rejectedAt: run.approval.rejectedAt ?? null,
            rejectedBy: run.approval.rejectedBy ?? null,
            note: run.approval.note ?? null
          };
          run.status = "failed";
          run.artifacts[definition.name] = loop.output;
          this.save(run);
          return;
        }

        loop.status = "running";
        loop.startedAt = Date.now();
        this.save(run);

        const result = await definition.execute(context);
        loop.status = "passed";
        loop.finishedAt = Date.now();
        loop.summary = result.summary;
        loop.output = result.output;
        run.artifacts[definition.name] = result.output;

        if (typeof result.qualityScore === "number") {
          run.qualityScore = result.qualityScore;
        }

        this.save(run);
        await sleep(loopPauseMs);
      }

      run.status = "succeeded";
      this.save(run);
    } catch (error) {
      const runningLoop = run.loops.find((loop) => loop.status === "running");
      if (runningLoop) {
        runningLoop.status = "failed";
        runningLoop.finishedAt = Date.now();
        runningLoop.summary = error instanceof Error ? error.message : "Unknown loop failure";
      }

      run.status = "failed";
      this.save(run);
    }
  }

  private save(run: Run): void {
    this.runs.save(run);
    this.onRunUpdated?.(run);
  }
}
