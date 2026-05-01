# AI-Loop-OS Architecture

AI-Loop-OS is organized as a loop-first autonomous engineering platform. The architecture separates orchestration, agents, tools, model providers, memory, evaluation, compliance, and observability so each part can evolve independently.

## System Context

```text
User Goal
   |
   v
Orchestrator Loop
   |
   +--> Planning Loop -----> Task Plan
   +--> Research Loop -----> Facts, Citations, Constraints
   +--> Coding Loop -------> Implementation Artifacts
   +--> Evaluation Loop ---> Quality Scores
   +--> Verification Loop -> Grounding and Compatibility Checks
   +--> Reflection Loop ---> Mistakes, Root Causes, Workflow Improvements
   +--> Retry Loop --------> Recovery Strategy
   +--> Security Loop -----> Vulnerability Findings
   +--> Compliance Loop ---> Compliance Evidence
   +--> Memory Loop -------> Episodic, Semantic, Procedural Memory
   +--> Deployment Loop ---> Rollout Plan
   +--> Monitoring Loop ---> Runtime Metrics
```

Every loop receives a run context, reads prior artifacts, emits logs, and writes a structured output. The orchestrator is responsible for ordering, status transitions, quality gates, and final aggregation.

## Runtime Components

### API Application

`apps/api` exposes the autonomous runtime over HTTP.

Responsibilities:

- Accept user objectives.
- Create and track runs.
- Execute loop pipelines.
- Store run artifacts and memory records.
- Serve loop metadata to the UI.
- Provide stable integration boundaries for future workers, queues, and workflow engines.

### UI Application

`apps/ui` is the operator dashboard.

Responsibilities:

- Submit goals.
- Configure compliance frameworks and retry budget.
- Display loop status, logs, and structured outputs.
- Show quality scores, security findings, compliance evidence, deployment readiness, and monitoring metrics.
- Surface memory records so users can see what the platform learned.

### Orchestrator

The orchestrator is the central loop runner. In the first version it is an in-process TypeScript executor. In production it can be replaced or backed by LangGraph, Temporal, or another durable workflow engine.

Core duties:

- Initialize run state.
- Execute loops in registry order.
- Pass artifacts forward between loops.
- Mark loop status as pending, running, passed, failed, or skipped.
- Enforce retry and quality gate decisions.
- Record timing, logs, and final run status.

### Loop Registry

The loop registry defines all available loops and their order. A loop is a typed function with a name, title, description, and executor.

Initial loops:

- planner
- research
- coding
- evaluation
- verification
- reflection
- retry
- security
- compliance
- memory
- deployment
- monitoring

Future loops can include critic, routing, cost, latency, learning, knowledge graph, human approval, multi-agent debate, simulation, and tool selection as dedicated registry entries.

### Agents

Agents are role-specific reasoning modules used by loops. The first version represents agents as deterministic helpers. Production versions can map agents to separate model policies, prompts, tools, and evaluation criteria.

Target agents:

- Planner agent
- Researcher agent
- Coder agent
- Reviewer agent
- Architect agent
- Security agent
- Compliance agent
- QA agent
- Deployment agent

### Tool Layer

Tools are not called directly by users. Loops select tools based on task needs.

Target tool categories:

- GitHub
- Terminal
- Docker
- Kubernetes
- Browser
- Search
- RAG
- MCP

The initial app mocks tool outputs through loop artifacts. MCP integration can later provide tool discovery, capability schemas, policy checks, and execution logs.

## Data Model

### Run

A run is one user objective moving through the loop system.

Key fields:

- `id`
- `goal`
- `status`
- `createdAt`
- `updatedAt`
- `compliance`
- `maxRetries`
- `loops`
- `artifacts`
- `qualityScore`

### Loop Record

A loop record captures one loop execution.

Key fields:

- `name`
- `title`
- `status`
- `startedAt`
- `finishedAt`
- `summary`
- `output`
- `logs`

### Memory Record

Memory records allow future runs to improve.

Kinds:

- Episodic: facts about completed tasks and outcomes.
- Semantic: durable concepts, constraints, and domain facts.
- Procedural: reusable workflows and fixes.

Production memory can expand into PostgreSQL rows, Neo4j graph nodes and edges, and Qdrant vector embeddings.

## Artifact Flow

1. Planning loop creates tasks and acceptance criteria.
2. Research loop attaches facts, citations, and constraints.
3. Coding loop produces an implementation outline and file plan.
4. Evaluation loop scores quality dimensions.
5. Verification loop validates grounding and dependency assumptions.
6. Reflection loop captures likely mistakes and improvements.
7. Retry loop decides whether to retry, switch model, ask an architect agent, or continue.
8. Security loop creates findings and mitigations.
9. Compliance loop maps evidence to requested frameworks.
10. Memory loop writes run learning.
11. Deployment loop creates release and rollback guidance.
12. Monitoring loop creates operational metrics.

## Security and Compliance

Security and compliance are first-class loops, not post-processing steps.

Security loop responsibilities:

- Dependency risk review.
- OWASP-oriented checks.
- Secret handling checks.
- SAST-style findings.
- Container and infrastructure scan placeholders.

Compliance loop responsibilities:

- Framework mapping for GDPR, HIPAA, SOC2, PCI-DSS, and ISO27001.
- Evidence generation.
- Approval checkpoint recommendations.
- Audit trail expectations.

## Observability

The monitoring loop records local metrics in the first version:

- Token estimate.
- Latency estimate.
- Loop duration.
- Success rate.
- Deployment readiness.
- Hallucination risk.

Production observability should use OpenTelemetry spans, Langfuse traces, Prometheus metrics, and Grafana dashboards.

## Deployment Architecture

Local development uses two processes:

```text
React UI -> Express API -> In-process Orchestrator -> In-memory Stores
```

Production can evolve into:

```text
React UI -> Gateway -> API -> Queue/Temporal -> Workers -> Providers/Tools/Memory/Observability
```

Deployment targets:

- Docker for local packaging.
- Kubernetes for production runtime.
- ArgoCD for GitOps rollout.
- GitHub Actions for CI checks and image publishing.

## Design Constraints

- No direct prompting path should bypass orchestration.
- Every loop must produce structured output.
- Every run must be inspectable after completion.
- Every provider must be replaceable.
- Human approval should be modeled as a loop boundary when actions become destructive, expensive, or compliance-sensitive.
- Cost and latency should be measured continuously, even when using mock providers.

## Extension Points

- Add a durable run store.
- Add streaming updates with Server-Sent Events or WebSockets.
- Add model routing policies.
- Add tool selection and approval policies.
- Add graph memory update jobs.
- Add real evaluation suites.
- Add autonomous pull request creation.
- Add deployment approval and rollback automation.
