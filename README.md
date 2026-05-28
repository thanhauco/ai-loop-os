# AI-Loop-OS

AI-Loop-OS is a production-shaped autonomous software engineering platform inspired by Claude Code and Codex-style loop architectures. It replaces direct prompting with a loop system where user objectives move through planning, research, coding, evaluation, verification, reflection, memory, security, compliance, deployment, and monitoring.

The initial implementation is a runnable local full-stack app. It uses deterministic mock providers and in-memory stores so the platform works immediately, while keeping clear interfaces for real LLMs, tools, databases, graph memory, queues, and observability.

## Core Idea

Instead of this flow:

```text
Human -> Prompt -> LLM
```

AI-Loop-OS uses this flow:

```text
Human -> Loop System -> Autonomous Improvement
```

Everything is a loop. No direct prompting. Every objective is decomposed, researched, implemented, evaluated, verified, reflected on, remembered, and monitored.

## What Is Included

- TypeScript Express API with an orchestrator loop runtime.
- Vite React dashboard for submitting goals and inspecting loop execution.
- Deterministic local LLM provider for development without API keys.
- In-memory run store and memory store.
- Structured loop artifacts for plans, research, code outlines, evaluations, verification, reflections, security checks, compliance evidence, deployment plans, and monitoring metrics.
- Clean interfaces for future LangGraph, Temporal, MCP, PostgreSQL, Neo4j, Qdrant, Langfuse, OpenTelemetry, Docker, Kubernetes, and ArgoCD integration.

## Loop Catalog

| Loop | Purpose |
| --- | --- |
| Planning | Decompose goals into executable tasks. |
| Research | Gather facts, constraints, citations, and implementation signals. |
| Coding | Generate or update implementation artifacts. |
| Evaluation | Score correctness, maintainability, architecture, readability, and complexity. |
| Verification | Check grounding, dependency compatibility, and factual correctness. |
| Reflection | Identify mistakes, root causes, and workflow improvements. |
| Retry | Select recovery strategies when quality gates fail. |
| Security | Detect vulnerabilities and produce security findings. |
| Compliance | Produce evidence for GDPR, HIPAA, SOC2, PCI-DSS, and ISO27001 style checks. |
| Memory | Store episodic, semantic, and procedural learning. |
| Deployment | Produce deployment readiness and rollout plans. |
| Monitoring | Track token usage, latency, success rate, failure rate, and production signals. |

Elite AI team loops such as critic, tool selection, routing, cost, latency, human approval, multi-agent debate, simulation, knowledge graph, and learning are represented in the architecture and can be promoted into dedicated runtime loops as the platform grows.

## Repository Layout

```text
ai-loop-os/
├── apps/
│   ├── api/
│   └── ui/
├── agents/
├── architecture.md
├── docs/
├── evaluations/
├── graph/
├── infra/
├── loops/
├── memory/
├── models/
├── observability/
├── plan.md
├── README.md
├── tools/
└── workflows/
```

The first version implements the runnable system under `apps/api` and `apps/ui`. The additional top-level folders document the production target and provide stable places for future integrations.

## Local Development

Prerequisites:

- Node.js 20 or newer.
- npm 10 or newer.

Install dependencies:

```bash
npm install
```

Run both apps:

```bash
npm run dev
```

Run the API only:

```bash
npm run dev:api
```

Run the UI only:

```bash
npm run dev:ui
```

Build everything:

```bash
npm run build
```

Default local URLs:

- API: `http://localhost:4000`
- UI: `http://localhost:5173`

## API Overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check. |
| `GET` | `/api/loops` | Loop metadata and execution order. |
| `POST` | `/api/runs` | Start a new autonomous run from a user goal. |
| `GET` | `/api/runs` | List recent runs. |
| `GET` | `/api/runs/:id` | Read one run with loop logs and artifacts. |
| `GET` | `/api/memory` | Read stored memory records. |

Example run request:

```json
{
  "goal": "Build a HIPAA-compliant hospital chatbot",
  "compliance": ["HIPAA", "SOC2"],
  "maxRetries": 2
}
```

## Development Principles

- Keep every capability behind a loop or provider interface.
- Prefer structured artifacts over free-form text.
- Make local development deterministic.
- Treat security, compliance, and observability as first-class loops.
- Store learning as memory records so future runs can improve.
- Keep mocks replaceable by real providers without changing the UI contract.

## Production Direction

The local app is intentionally small, but the architecture is shaped for production:

- LangGraph or Temporal can replace the local orchestrator executor.
- MCP can provide tool discovery and tool execution.
- PostgreSQL can persist run state and audit trails.
- Neo4j can power knowledge graph memory.
- Qdrant can provide vector memory and retrieval.
- Langfuse and OpenTelemetry can capture traces, spans, model costs, and latency.
- Docker, Kubernetes, GitHub Actions, and ArgoCD can handle deployment and release automation.

The final vision is simple: a human provides an objective; AI-Loop-OS plans, researches, codes, tests, reviews, secures, deploys, monitors, learns, and improves with minimal human intervention.

## Implementation Status Addendum

The current app base now includes more than the initial local mock demo:

- API, UI, gateway, and worker npm workspaces.
- Workflow-driven loop selection through `GET /api/workflows` and `POST /api/runs`.
- Server-Sent Events at `GET /api/runs/:id/events` for live run updates.
- Human approval gates with `POST /api/runs/:id/approve` and `POST /api/runs/:id/reject`.
- Approval RBAC using `x-operator-role: approver`, `x-operator-id`, and optional `OPERATOR_TOKEN` bearer enforcement.
- Configurable model providers: mock by default, or OpenAI-compatible HTTP chat completions with environment variables.
- Local JSON persistence by default, with optional PostgreSQL mirroring when `DATABASE_URL` is configured.
- Telemetry events at `GET /api/telemetry` and Prometheus-style metrics at `GET /metrics`.
- Automated API tests using Node's built-in test runner.
- GitHub Actions CI for install, build, and tests.

## Additional Commands

Run all tests:

```bash
npm test
```

Run API, gateway, worker, and UI together:

```bash
npm run dev:all
```

Run the gateway only:

```bash
npm run dev:gateway
```

Run the worker only:

```bash
npm run dev:worker
```

## Environment Configuration

Copy `.env.example` when configuring non-default behavior.

Key settings:

| Variable | Purpose |
| --- | --- |
| `DATA_DIR` | Local JSON persistence directory. |
| `DATABASE_URL` | Optional PostgreSQL mirror for runs and memory records. |
| `OPERATOR_TOKEN` | Optional bearer token required for approve/reject endpoints. |
| `LLM_PROVIDER` | `mock` or `openai-compatible`. |
| `LLM_BASE_URL` | OpenAI-compatible `/v1` base URL. |
| `LLM_MODEL` | Model name for OpenAI-compatible providers. |
| `LLM_API_KEY` | API key required when `LLM_PROVIDER=openai-compatible`. |

## Production Gaps That Remain

The app now has production-shaped hooks, but a real deployment still needs externally provisioned services and operational policies:

- A real PostgreSQL instance if `DATABASE_URL` is used.
- Real model credentials if `LLM_PROVIDER=openai-compatible` is used.
- Actual Semgrep, Trivy, Ragas, DeepEval, Langfuse, OpenTelemetry collector, Kubernetes, ArgoCD, Neo4j, and Qdrant integrations behind the existing loop/provider boundaries.
- Stronger identity integration for multi-user deployments, such as Entra ID or another OIDC provider.
