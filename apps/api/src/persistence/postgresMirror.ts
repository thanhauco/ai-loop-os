import { Pool } from "pg";
import type { MemoryRecord, Run } from "../types.js";

export class PostgresMirror {
  private readonly pool: Pool;
  private ready: Promise<void> | undefined;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async upsertRun(run: Run): Promise<void> {
    await this.ensureReady();
    await this.pool.query(
      `insert into runs (id, status, workflow, goal, payload, updated_at)
       values ($1, $2, $3, $4, $5, to_timestamp($6 / 1000.0))
       on conflict (id) do update set
         status = excluded.status,
         workflow = excluded.workflow,
         goal = excluded.goal,
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
      [run.id, run.status, run.workflow, run.goal, run, run.updatedAt]
    );
  }

  async insertMemory(record: MemoryRecord): Promise<void> {
    await this.ensureReady();
    await this.pool.query(
      `insert into memory_records (id, run_id, kind, payload, created_at)
       values ($1, $2, $3, $4, to_timestamp($5 / 1000.0))
       on conflict (id) do nothing`,
      [record.id, record.runId, record.kind, record, record.createdAt]
    );
  }

  safeUpsertRun(run: Run): void {
    void this.upsertRun(run).catch((error) => {
      console.error("PostgreSQL run mirror failed", error instanceof Error ? error.message : error);
    });
  }

  safeInsertMemory(record: MemoryRecord): void {
    void this.insertMemory(record).catch((error) => {
      console.error("PostgreSQL memory mirror failed", error instanceof Error ? error.message : error);
    });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private ensureReady(): Promise<void> {
    this.ready ??= this.initialize();
    return this.ready;
  }

  private async initialize(): Promise<void> {
    await this.pool.query(`
      create table if not exists runs (
        id text primary key,
        status text not null,
        workflow text not null,
        goal text not null,
        payload jsonb not null,
        updated_at timestamptz not null
      )
    `);
    await this.pool.query(`
      create table if not exists memory_records (
        id text primary key,
        run_id text not null,
        kind text not null,
        payload jsonb not null,
        created_at timestamptz not null
      )
    `);
    await this.pool.query(`create index if not exists idx_runs_status on runs(status)`);
    await this.pool.query(`create index if not exists idx_memory_run_id on memory_records(run_id)`);
  }
}
