import { nanoid } from "nanoid";
import type { LoopName, LoopRecord, Run, RunRequest } from "../types.js";
import { JsonFileStore } from "./jsonFileStore.js";

export const loopOrder: Array<{ name: LoopName; title: string }> = [
  { name: "planner", title: "Planning Loop" },
  { name: "research", title: "Research Loop" },
  { name: "coding", title: "Coding Loop" },
  { name: "evaluation", title: "Evaluation Loop" },
  { name: "verification", title: "Verification Loop" },
  { name: "reflection", title: "Reflection Loop" },
  { name: "retry", title: "Retry Loop" },
  { name: "security", title: "Security Loop" },
  { name: "compliance", title: "Compliance Loop" },
  { name: "memory", title: "Memory Loop" },
  { name: "deployment", title: "Deployment Loop" },
  { name: "monitoring", title: "Monitoring Loop" }
];

export class RunStore {
  private readonly runs = new Map<string, Run>();
  private readonly persistence?: JsonFileStore<Run[]>;

  constructor(filePath?: string) {
    if (!filePath) {
      return;
    }

    this.persistence = new JsonFileStore<Run[]>(filePath, []);
    for (const run of this.persistence.read()) {
      this.runs.set(run.id, run);
    }
  }

  create(request: RunRequest): Run {
    const now = Date.now();
    const loops: LoopRecord[] = loopOrder.map((loop) => ({
      ...loop,
      status: "pending",
      logs: []
    }));

    const run = {
      id: nanoid(),
      goal: request.goal.trim(),
      status: "queued",
      createdAt: now,
      updatedAt: now,
      compliance: request.compliance?.length ? request.compliance : ["SOC2"],
      maxRetries: request.maxRetries ?? 2,
      loops,
      artifacts: {}
    } satisfies Run;

    this.runs.set(run.id, run);
    this.persist();
    return run;
  }

  list(): Run[] {
    return [...this.runs.values()].sort((left, right) => right.createdAt - left.createdAt);
  }

  get(id: string): Run | undefined {
    return this.runs.get(id);
  }

  save(run: Run): Run {
    run.updatedAt = Date.now();
    this.runs.set(run.id, run);
    this.persist();
    return run;
  }

  private persist(): void {
    this.persistence?.write(this.list());
  }
}
