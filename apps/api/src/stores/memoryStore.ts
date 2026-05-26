import { nanoid } from "nanoid";
import type { MemoryRecord, MemoryStore } from "../types.js";
import { JsonFileStore } from "./jsonFileStore.js";

export class InMemoryMemoryStore implements MemoryStore {
  private readonly records: MemoryRecord[] = [];
  private readonly persistence?: JsonFileStore<MemoryRecord[]>;

  constructor(
    filePath?: string,
    private readonly onSave?: (record: MemoryRecord) => void
  ) {
    if (!filePath) {
      return;
    }

    this.persistence = new JsonFileStore<MemoryRecord[]>(filePath, []);
    this.records.push(...this.persistence.read());
  }

  save(record: Omit<MemoryRecord, "id" | "createdAt">): MemoryRecord {
    const saved = {
      ...record,
      id: nanoid(),
      createdAt: Date.now()
    } satisfies MemoryRecord;

    this.records.unshift(saved);
    this.persist();
    this.onSave?.(saved);
    return saved;
  }

  query(kind?: MemoryRecord["kind"]): MemoryRecord[] {
    if (!kind) {
      return [...this.records];
    }

    return this.records.filter((record) => record.kind === kind);
  }

  private persist(): void {
    this.persistence?.write(this.records);
  }
}
