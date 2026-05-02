import { nanoid } from "nanoid";
import type { MemoryRecord, MemoryStore } from "../types.js";

export class InMemoryMemoryStore implements MemoryStore {
  private readonly records: MemoryRecord[] = [];

  save(record: Omit<MemoryRecord, "id" | "createdAt">): MemoryRecord {
    const saved = {
      ...record,
      id: nanoid(),
      createdAt: Date.now()
    } satisfies MemoryRecord;

    this.records.unshift(saved);
    return saved;
  }

  query(kind?: MemoryRecord["kind"]): MemoryRecord[] {
    if (!kind) {
      return [...this.records];
    }

    return this.records.filter((record) => record.kind === kind);
  }
}
