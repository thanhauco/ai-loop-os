# AI-Loop-OS Implementation Plan

AI-Loop-OS is a full-stack autonomous software engineering platform built around one rule: all work flows through loops. The first version is a runnable local system that demonstrates orchestration, planning, research, coding, evaluation, verification, reflection, memory, security, compliance, deployment, and monitoring without requiring external LLM keys or cloud services.

## Delivery Goals

- Replace direct prompting with a loop-driven execution flow.
- Provide a backend orchestrator that executes named loops and records artifacts.
- Provide a frontend dashboard where users submit objectives and inspect loop progress.
- Keep provider boundaries clean so mock services can later be replaced by LangGraph, Temporal, MCP, PostgreSQL, Neo4j, Qdrant, Langfuse, OpenTelemetry, Kubernetes, and ArgoCD.
- Document the product contract before extending implementation.

## Phase 1: Documentation Foundation

Deliver root documentation first:

- `plan.md`: implementation roadmap and verification checklist.
- `README.md`: product overview, setup, usage, and development commands.
- `architecture.md`: system design, loop model, runtime boundaries, and future integrations.

Exit criteria:

- All three documents exist at the repository root.
- The documents cover the full loop architecture from the product brief.
- The implementation uses these documents as the source of truth.

## Phase 2: Monorepo Scaffold

Create a TypeScript npm workspace with two runnable apps:

- `apps/api`: Express API and loop orchestrator.
- `apps/ui`: Vite React dashboard.

Exit criteria:

- `npm install` succeeds from the repository root.
- Workspace scripts can build both apps.
- The frontend can call the backend through a local API URL.

## Phase 3: Backend Loop Runtime

Implement the backend as a compact production-shaped runtime:

- Run registry with all core loops.
- Orchestrator that executes loops in a deterministic order.
- In-memory run store for queued/running/completed runs.
- Mock LLM provider for deterministic local output.
- Memory store with episodic, semantic, and procedural records.
- REST endpoints for creating runs, listing runs, reading run details, reading loop metadata, and reading memory.

Initial loop order:

1. Planning
2. Research
3. Coding
4. Evaluation
5. Verification
6. Reflection
7. Retry
8. Security
9. Compliance
10. Memory
11. Deployment
12. Monitoring

Exit criteria:

- `POST /api/runs` creates a run from a user goal.
- `GET /api/runs/:id` returns loop status, logs, artifacts, and scores.
- Loop execution produces structured outputs matching the product brief.

## Phase 4: Frontend Experience

Build a working dashboard, not a landing page:

- Goal submission form with compliance options and retry budget.
- Loop timeline showing status, summary, logs, and structured output.
- Artifact panels for plan, research facts, generated code outline, evaluation score, security findings, compliance evidence, deployment plan, and monitoring metrics.
- Memory panel showing what the system learned from prior runs.

Exit criteria:

- Users can submit a goal and watch loop results update.
- The UI is responsive on desktop and mobile.
- The dashboard exposes the autonomous loop model clearly without relying on marketing copy.

## Phase 5: Verification

Run local verification:

- `npm install`
- `npm run build`
- Start the dev server with `npm run dev`
- Smoke-test API endpoints.
- Open the UI and submit a goal.

Exit criteria:

- Backend and frontend build successfully.
- Dev server starts without missing dependency errors.
- A run completes and displays all loop outputs.

## Phase 6: Production Upgrade Path

The first version keeps external systems behind interfaces. Future production upgrades should replace local mocks with real services:

- Orchestration: LangGraph and Temporal.
- Tools: MCP servers for GitHub, terminal, browser, search, Docker, Kubernetes, and RAG.
- Models: Claude, GPT, Gemini, DeepSeek, Qwen, and local Llama via routing policies.
- Memory: PostgreSQL, Neo4j, and Qdrant.
- Evaluation: DeepEval, Ragas, and OpenEvals.
- Observability: Langfuse, OpenTelemetry, Prometheus, and Grafana.
- Deployment: Docker, Kubernetes, GitHub Actions, and ArgoCD.

## 2027 Upgrade Backlog

- Self-improving prompts.
- Self-improving workflows.
- Autonomous architecture review.
- Autonomous pull request creation.
- Autonomous deployment approval.
- Knowledge graph evolution.
- Multi-agent debate.
- Long-term memory compression.
- Adaptive context assembly.
- Model routing marketplace.

## Working Agreement

Documentation is the contract. Code should stay small, typed, and replaceable. Every loop should produce a structured artifact and a concise human-readable summary. New integrations should extend interfaces instead of rewriting the orchestrator.
