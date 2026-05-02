import { loopRegistry } from "./loops/registry.js";
import type { LlmProvider, LoopName, MemoryStore, RunContext } from "./types.js";
import type { RunStore } from "./stores/runStore.js";

const loopPauseMs = 140;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Orchestrator {
  constructor(
    private readonly runs: RunStore,
    private readonly memory: MemoryStore,
    private readonly llm: LlmProvider
  ) {}

  async execute(runId: string): Promise<void> {
    const run = this.runs.get(runId);

    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    run.status = "running";
    this.runs.save(run);

    const emit: RunContext["emit"] = (loopName: LoopName, line: string) => {
      const loop = run.loops.find((candidate) => candidate.name === loopName);
      if (!loop) {
        return;
      }

      loop.logs.push(`${new Date().toISOString()} ${line}`);
      this.runs.save(run);
    };

    const context = {
      run,
      emit,
      memory: this.memory,
      llm: this.llm
    } satisfies RunContext;

    try {
      for (const definition of loopRegistry) {
        const loop = run.loops.find((candidate) => candidate.name === definition.name);
        if (!loop) {
          continue;
        }

        loop.status = "running";
        loop.startedAt = Date.now();
        this.runs.save(run);

        const result = await definition.execute(context);
        loop.status = "passed";
        loop.finishedAt = Date.now();
        loop.summary = result.summary;
        loop.output = result.output;
        run.artifacts[definition.name] = result.output;

        if (typeof result.qualityScore === "number") {
          run.qualityScore = result.qualityScore;
        }

        this.runs.save(run);
        await sleep(loopPauseMs);
      }

      run.status = "succeeded";
      this.runs.save(run);
    } catch (error) {
      const runningLoop = run.loops.find((loop) => loop.status === "running");
      if (runningLoop) {
        runningLoop.status = "failed";
        runningLoop.finishedAt = Date.now();
        runningLoop.summary = error instanceof Error ? error.message : "Unknown loop failure";
      }

      run.status = "failed";
      this.runs.save(run);
    }
  }
}
