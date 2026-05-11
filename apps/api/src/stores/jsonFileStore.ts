import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export class JsonFileStore<T> {
  constructor(
    private readonly filePath: string,
    private readonly fallback: T
  ) {}

  read(): T {
    if (!existsSync(this.filePath)) {
      return this.fallback;
    }

    try {
      return JSON.parse(readFileSync(this.filePath, "utf8")) as T;
    } catch {
      return this.fallback;
    }
  }

  write(value: T): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    renameSync(tempPath, this.filePath);
  }
}
