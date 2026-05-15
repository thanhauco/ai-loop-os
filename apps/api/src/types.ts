// Shared domain types for the AI-Loop-OS orchestrator.

export type LoopName =
  | "planner"
  | "research"
  | "coding"
  | "evaluation"
  | "verification"
  | "reflection"
  | "retry"
  | "security"
  | "compliance"
  | "human_approval"
  | "memory"
  | "deployment"
  | "monitoring";

export type LoopStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface LoopRecord {
  name: LoopName;
  title: string;
  status: LoopStatus;
  startedAt?: number;
  finishedAt?: number;
  summary?: string;
  /** Arbitrary structured output produced by the loop. */
  output?: Record<string, unknown>;
  /** Human-readable log lines emitted while the loop ran. */
  logs: string[];
}

export type RunStatus = "queued" | "running" | "awaiting_approval" | "succeeded" | "failed";

export interface RunRequest {
  goal: string;
  /** Workflow template used to select the loop sequence. */
  workflow?: string;
  /** Optional compliance frameworks to enforce. */
  compliance?: string[];
  /** Maximum retry attempts for the coding loop. */
  maxRetries?: number;
}

export interface Run {
  id: string;
  goal: string;
  status: RunStatus;
  workflow: string;
  approval: RunApproval;
  createdAt: number;
  updatedAt: number;
  compliance: string[];
  maxRetries: number;
  loops: LoopRecord[];
  /** Final aggregated artifacts. */
  artifacts: Record<string, unknown>;
  /** Overall quality score 0-100. */
  qualityScore?: number;
}

export interface RunApproval {
  status: "not_required" | "pending" | "approved" | "rejected";
  gates: string[];
  requestedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  approvedBy?: string;
  rejectedBy?: string;
  note?: string;
}

export interface WorkflowDefinition {
  name: string;
  title: string;
  description: string;
  loops: LoopName[];
  approvalGates?: string[];
  qualityGates: Record<string, unknown>;
}

export interface RunContext {
  run: Run;
  emit: (loop: LoopName, line: string) => void;
  llm: LlmProvider;
  memory: MemoryStore;
}

export interface LoopDefinition {
  name: LoopName;
  title: string;
  description: string;
  execute: (context: RunContext) => Promise<LoopResult>;
}

export interface LoopResult {
  summary: string;
  output: Record<string, unknown>;
  qualityScore?: number;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmProvider {
  readonly name: string;
  complete(messages: LlmMessage[], opts?: { temperature?: number }): Promise<string>;
}

export interface MemoryRecord {
  id: string;
  kind: "episodic" | "semantic" | "procedural";
  runId: string;
  data: Record<string, unknown>;
  createdAt: number;
}

export interface MemoryStore {
  save(record: Omit<MemoryRecord, "id" | "createdAt">): MemoryRecord;
  query(kind?: MemoryRecord["kind"]): MemoryRecord[];
}
