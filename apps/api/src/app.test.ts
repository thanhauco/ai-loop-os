import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApiApp } from "./app.js";
import { createLlmProvider } from "./providers/providerFactory.js";
import type { Run } from "./types.js";

let dataDir: string;
let agent: ReturnType<typeof request>;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "ai-loop-os-api-"));
  agent = request(createApiApp({ dataDir }).app);
});

afterEach(() => {
  rmSync(dataDir, { force: true, recursive: true });
});

async function waitForRun(id: string, predicate: (run: Run) => boolean): Promise<Run> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await agent.get(`/api/runs/${id}`).expect(200);
    const run = response.body as Run;
    if (predicate(run)) {
      return run;
    }

    await new Promise((resolve) => setTimeout(resolve, 75));
  }

  throw new Error(`Timed out waiting for run ${id}`);
}

describe("AI-Loop-OS API", () => {
  it("lists runtime workflows", async () => {
    const response = await agent.get("/api/workflows").expect(200);
    assert.equal(response.body.length, 5);
    assert.ok(response.body.some((workflow: { name: string }) => workflow.name === "build_feature"));
  });

  it("uses mock model provider by default", () => {
    assert.equal(createLlmProvider({}).name, "mock-local-loop-model");
  });

  it("requires an API key for OpenAI-compatible providers", () => {
    assert.throws(
      () => createLlmProvider({ LLM_PROVIDER: "openai-compatible" }),
      /LLM_API_KEY is required/
    );
  });

  it("creates workflow-specific runs", async () => {
    const created = await agent
      .post("/api/runs")
      .send({ goal: "Review the loop runtime", workflow: "code_review", compliance: ["SOC2"], maxRetries: 1 })
      .expect(202);

    const run = await waitForRun(created.body.id, (candidate) => candidate.status === "succeeded");
    assert.equal(run.workflow, "code_review");
    assert.deepEqual(
      run.loops.map((loop) => loop.name),
      ["research", "multi_agent_debate", "evaluation", "critic", "verification", "security", "compliance", "reflection", "knowledge_graph", "memory"]
    );
    assert.ok(run.artifacts.multi_agent_debate);
  });

  it("pauses gated workflows until approval", async () => {
    const created = await agent
      .post("/api/runs")
      .send({ goal: "Release with approval", workflow: "release", compliance: ["SOC2"], maxRetries: 1 })
      .expect(202);

    const paused = await waitForRun(created.body.id, (candidate) => candidate.status === "awaiting_approval");
    assert.equal(paused.approval.status, "pending");
    assert.equal(paused.loops.find((loop) => loop.name === "human_approval")?.status, "running");

    await agent.post(`/api/runs/${created.body.id}/approve`).send({ approvedBy: "test-operator" }).expect(403);

    await agent
      .post(`/api/runs/${created.body.id}/approve`)
      .set("x-operator-role", "approver")
      .set("x-operator-id", "test-operator")
      .send({ approvedBy: "test-operator", note: "test approval" })
      .expect(200);

    const completed = await waitForRun(created.body.id, (candidate) => candidate.status === "succeeded");
    assert.equal(completed.approval.status, "approved");
    assert.equal(completed.loops.every((loop) => loop.status === "passed"), true);
  });

  it("persists runs and memory to the configured data directory", async () => {
    const created = await agent
      .post("/api/runs")
      .send({ goal: "Persist this run", workflow: "security_scan", compliance: ["SOC2"], maxRetries: 1 })
      .expect(202);

    await waitForRun(created.body.id, (candidate) => candidate.status === "succeeded");

    const restartedAgent = request(createApiApp({ dataDir }).app);
    const restored = await restartedAgent.get(`/api/runs/${created.body.id}`).expect(200);
    const memory = await restartedAgent.get("/api/memory").expect(200);

    assert.equal(restored.body.id, created.body.id);
    assert.ok(memory.body.length >= 3);
  });

  it("streams run updates with server-sent events", async () => {
    const { app } = createApiApp({ dataDir });
    const server = app.listen(0);

    try {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      const baseUrl = `http://127.0.0.1:${address.port}`;
      const createdResponse = await fetch(`${baseUrl}/api/runs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ goal: "Stream this run", workflow: "security_scan", compliance: ["SOC2"], maxRetries: 1 })
      });
      assert.equal(createdResponse.status, 202);
      const created = (await createdResponse.json()) as Run;

      const abort = new AbortController();
      const streamResponse = await fetch(`${baseUrl}/api/runs/${created.id}/events`, {
        headers: { accept: "text/event-stream" },
        signal: abort.signal
      });
      assert.equal(streamResponse.status, 200);
      const reader = streamResponse.body?.getReader();
      assert.ok(reader);
      const chunk = await reader.read();
      abort.abort();

      const text = new TextDecoder().decode(chunk.value);
      assert.match(text, /event: run/);
      assert.match(text, new RegExp(created.id));
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("exposes telemetry events and Prometheus metrics", async () => {
    const created = await agent
      .post("/api/runs")
      .send({ goal: "Measure this run", workflow: "security_scan", compliance: ["SOC2"], maxRetries: 1 })
      .expect(202);

    await waitForRun(created.body.id, (candidate) => candidate.status === "succeeded");

    const telemetry = await agent.get("/api/telemetry").expect(200);
    const metrics = await agent.get("/metrics").expect(200);

    assert.ok(telemetry.body.some((event: { type: string }) => event.type === "run_completed"));
    assert.match(metrics.text, /ai_loop_os_runs_total/);
    assert.match(metrics.text, /ai_loop_os_completed_loops_total/);
  });
});
