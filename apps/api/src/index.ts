import cors from "cors";
import express from "express";
import { join } from "node:path";
import { RunEventBus } from "./events/runEvents.js";
import { loopRegistry } from "./loops/registry.js";
import { Orchestrator } from "./orchestrator.js";
import { MockLlmProvider } from "./providers/mockLlmProvider.js";
import { InMemoryMemoryStore } from "./stores/memoryStore.js";
import { RunStore } from "./stores/runStore.js";
import type { RunRequest } from "./types.js";
import { findWorkflow, workflowRegistry } from "./workflows/registry.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const dataDir = process.env.DATA_DIR ?? join(process.cwd(), ".data");
const runs = new RunStore(join(dataDir, "runs.json"));
const memory = new InMemoryMemoryStore(join(dataDir, "memory.json"));
const llm = new MockLlmProvider();
const runEvents = new RunEventBus();
const orchestrator = new Orchestrator(runs, memory, llm, (run) => runEvents.publish(run));

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "ai-loop-os-api", modelProvider: llm.name, dataDir });
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

app.get("/api/workflows", (_request, response) => {
  response.json(workflowRegistry);
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

  if (body.workflow && !workflowRegistry.some((workflow) => workflow.name === body.workflow)) {
    response.status(400).json({ error: "Unknown workflow." });
    return;
  }

  const workflow = findWorkflow(body.workflow);
  const run = runs.create(body, { workflowName: workflow.name, loopNames: workflow.loops });
  runEvents.publish(run);
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

app.get("/api/runs/:id/events", (request, response) => {
  const run = runs.get(request.params.id);

  if (!run) {
    response.status(404).json({ error: "Run not found." });
    return;
  }

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const send = (nextRun: typeof run) => {
    response.write(`event: run\n`);
    response.write(`data: ${JSON.stringify(nextRun)}\n\n`);
  };

  send(run);
  const unsubscribe = runEvents.subscribe(run.id, send);
  const heartbeat = setInterval(() => response.write(`: heartbeat\n\n`), 15000);

  request.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    response.end();
  });
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
