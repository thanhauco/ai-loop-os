import cors from "cors";
import express from "express";
import { loopRegistry } from "./loops/registry.js";
import { Orchestrator } from "./orchestrator.js";
import { MockLlmProvider } from "./providers/mockLlmProvider.js";
import { InMemoryMemoryStore } from "./stores/memoryStore.js";
import { RunStore } from "./stores/runStore.js";
import type { RunRequest } from "./types.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const runs = new RunStore();
const memory = new InMemoryMemoryStore();
const llm = new MockLlmProvider();
const orchestrator = new Orchestrator(runs, memory, llm);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "ai-loop-os-api", modelProvider: llm.name });
});

app.get("/api/loops", (_request, response) => {
  response.json(
    loopRegistry.map(({ name, title, description }, index) => ({
      name,
      title,
      description,
      order: index + 1
    }))
  );
});

app.get("/api/runs", (_request, response) => {
  response.json(runs.list());
});

app.post("/api/runs", (request, response) => {
  const body = request.body as RunRequest;

  if (!body.goal || typeof body.goal !== "string" || !body.goal.trim()) {
    response.status(400).json({ error: "A non-empty goal is required." });
    return;
  }

  const run = runs.create(body);
  void orchestrator.execute(run.id);

  response.status(202).json(run);
});

app.get("/api/runs/:id", (request, response) => {
  const run = runs.get(request.params.id);

  if (!run) {
    response.status(404).json({ error: "Run not found." });
    return;
  }

  response.json(run);
});

app.get("/api/memory", (request, response) => {
  const kind = typeof request.query.kind === "string" ? request.query.kind : undefined;
  if (kind && !["episodic", "semantic", "procedural"].includes(kind)) {
    response.status(400).json({ error: "Invalid memory kind." });
    return;
  }

  response.json(memory.query(kind as "episodic" | "semantic" | "procedural" | undefined));
});

app.listen(port, () => {
  console.log(`AI-Loop-OS API listening on http://localhost:${port}`);
});
