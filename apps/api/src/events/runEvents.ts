import { EventEmitter } from "node:events";
import type { Run } from "../types.js";

type RunEventHandler = (run: Run) => void;

export class RunEventBus {
  private readonly emitter = new EventEmitter();

  publish(run: Run): void {
    this.emitter.emit(run.id, run);
  }

  subscribe(runId: string, handler: RunEventHandler): () => void {
    this.emitter.on(runId, handler);
    return () => this.emitter.off(runId, handler);
  }
}
