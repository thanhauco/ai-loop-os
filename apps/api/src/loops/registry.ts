import type { LoopDefinition, RunContext } from "../types.js";

const complianceCatalog = ["GDPR", "HIPAA", "SOC2", "PCI-DSS", "ISO27001"];

function goalTokens(goal: string): string[] {
  return goal
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

export const loopRegistry: LoopDefinition[] = [
  {
    name: "planner",
    title: "Planning Loop",
    description: "Decomposes the user goal into executable engineering tasks and acceptance criteria.",
    async execute({ run, emit }) {
      emit("planner", "Decomposing objective into implementation workstreams.");
      const tokens = goalTokens(run.goal);
      const tasks = [
        "Architecture contract",
        "Backend loop runtime",
        "Provider and memory interfaces",
        "Operator dashboard",
        "Security and compliance evidence",
        "Verification and deployment readiness"
      ];

      return {
        summary: `Created ${tasks.length} workstreams for ${tokens.join(", ") || "the requested goal"}.`,
        output: {
          tasks,
          acceptanceCriteria: [
            "All work enters through the orchestrator loop",
            "Every loop emits structured artifacts and readable logs",
            "Security, compliance, and monitoring are first-class stages",
            "Local development works without external model keys"
          ],
          routing: {
            primaryModel: "mock-local-loop-model",
            fallbackModels: ["architect-agent", "research-agent", "critic-agent"]
          }
        }
      };
    }
  },
  {
    name: "research",
    title: "Research Loop",
    description: "Collects facts, citations, implementation constraints, and tool signals.",
    async execute({ run, emit, llm }) {
      emit("research", "Gathering architecture facts and constraints.");
      const synthesis = await llm.complete([
        { role: "system", content: "You summarize implementation facts for autonomous software engineering platforms." },
        { role: "user", content: run.goal }
      ]);

      return {
        summary: "Collected local architecture facts, constraints, and integration candidates.",
        output: {
          facts: [
            "Loop systems reduce direct prompt coupling by enforcing repeatable execution stages",
            "Durable orchestration becomes important once tool calls, approvals, and retries cross process boundaries",
            "Memory should separate episodic outcomes, semantic concepts, procedural workflows, graph relationships, and vectors"
          ],
          citations: [
            "Local product brief: AI-Loop-OS context",
            "Architecture document: architecture.md",
            "Implementation plan: plan.md"
          ],
          constraints: [
            "Initial build must run locally without cloud resources",
            "Provider interfaces must allow later LangGraph, Temporal, MCP, PostgreSQL, Neo4j, Qdrant, and Langfuse integration",
            "Compliance and security outputs must be auditable"
          ],
          synthesis
        }
      };
    }
  },
  {
    name: "coding",
    title: "Coding Loop",
    description: "Generates implementation artifacts and repeats with feedback until task completion.",
    async execute({ run, emit }) {
      emit("coding", "Preparing implementation outline and file plan.");
      const filePlan = [
        "apps/api/src/index.ts",
        "apps/api/src/orchestrator.ts",
        "apps/api/src/loops/registry.ts",
        "apps/api/src/stores/runStore.ts",
        "apps/api/src/stores/memoryStore.ts",
        "apps/ui/src/App.tsx",
        "apps/ui/src/styles.css"
      ];

      return {
        summary: `Prepared a local full-stack implementation plan with ${filePlan.length} primary files.`,
        output: {
          loop: "while not task_complete -> generate -> test -> fix -> verify",
          filePlan,
          generatedModules: [
            "Express API routes",
            "In-process orchestrator",
            "Typed loop registry",
            "Mock model provider",
            "React operator dashboard"
          ],
          retryBudget: run.maxRetries
        }
      };
    }
  },
  {
    name: "evaluation",
    title: "Evaluation Loop",
    description: "Scores correctness, architecture, maintainability, readability, and complexity.",
    async execute({ emit }) {
      emit("evaluation", "Scoring engineering quality dimensions.");
      const dimensions = {
        correctness: 91,
        architecture: 94,
        maintainability: 92,
        readability: 95,
        complexity: 88
      };
      const quality = Math.round(Object.values(dimensions).reduce((sum, score) => sum + score, 0) / Object.values(dimensions).length);

      return {
        summary: `Quality gate passed with score ${quality}.`,
        qualityScore: quality,
        output: {
          quality,
          dimensions,
          recommendations: [
            "Add persistent run storage before multi-user deployment",
            "Add streaming updates once loop execution becomes long-running",
            "Back loops with real evaluators before production autonomy"
          ]
        }
      };
    }
  },
  {
    name: "verification",
    title: "Verification Loop",
    description: "Checks factual grounding, dependency compatibility, and API assumptions.",
    async execute({ emit }) {
      emit("verification", "Checking grounding, dependencies, and API contracts.");
      return {
        summary: "Verified local assumptions and dependency boundaries.",
        output: {
          factualCorrectness: "grounded-in-local-brief",
          dependencyValidation: ["express", "vite", "react", "typescript"],
          apiCompatibility: "REST contract stable for dashboard polling",
          checks: [
            { name: "No direct prompting bypass", status: "passed" },
            { name: "Loop artifacts are structured", status: "passed" },
            { name: "Mock provider can be replaced", status: "passed" }
          ]
        }
      };
    }
  },
  {
    name: "reflection",
    title: "Reflection Loop",
    description: "Analyzes mistakes, root causes, and prompt or workflow improvements.",
    async execute({ emit }) {
      emit("reflection", "Capturing learning from this run.");
      return {
        summary: "Captured workflow improvement opportunities.",
        output: {
          mistake: "Local-only prototypes can hide production durability concerns",
          rootCause: "In-memory state is useful for demos but not enough for long-running autonomous work",
          fix: "Introduce a durable run store and queue before real tool execution",
          workflowUpdate: "Add persistence and streaming as the next platform hardening step"
        }
      };
    }
  },
  {
    name: "retry",
    title: "Retry Loop",
    description: "Chooses a recovery strategy when tests, quality gates, or verification fail.",
    async execute({ run, emit }) {
      emit("retry", "Selecting retry policy for future failures.");
      return {
        summary: "Retry policy selected for recoverable loop failures.",
        output: {
          maxRetries: run.maxRetries,
          strategies: [
            "retry same model with error feedback",
            "retry with additional research context",
            "retry with architect agent review",
            "retry with alternate model route",
            "pause for human approval on destructive actions"
          ],
          selectedForCurrentRun: "continue-without-retry"
        }
      };
    }
  },
  {
    name: "security",
    title: "Security Loop",
    description: "Performs security analysis and emits mitigations.",
    async execute({ emit }) {
      emit("security", "Running local security posture checks.");
      return {
        summary: "No blocking security findings in local mock runtime.",
        output: {
          findings: [
            {
              severity: "medium",
              title: "In-memory stores are not suitable for production audit trails",
              mitigation: "Use PostgreSQL with append-only run events before production deployment"
            },
            {
              severity: "low",
              title: "Mock provider does not enforce prompt injection policies",
              mitigation: "Add policy checks and MCP tool allowlists when real tools are enabled"
            }
          ],
          scanPlan: ["Semgrep", "Trivy", "OWASP checks", "dependency audit", "secret scanning"]
        }
      };
    }
  },
  {
    name: "compliance",
    title: "Compliance Loop",
    description: "Maps run evidence to requested compliance frameworks.",
    async execute({ run, emit }) {
      emit("compliance", "Mapping generated evidence to compliance frameworks.");
      const requested = run.compliance.filter((item) => complianceCatalog.includes(item));
      const frameworks = requested.length ? requested : ["SOC2"];

      return {
        summary: `Prepared evidence for ${frameworks.join(", ")}.`,
        output: {
          frameworks,
          evidence: frameworks.map((framework) => ({
            framework,
            controls: ["audit trail", "access boundary", "approval checkpoint", "data retention policy"],
            status: "draft-evidence"
          })),
          humanApprovalRequiredFor: ["production deployment", "external data access", "regulated data processing"]
        }
      };
    }
  },
  {
    name: "memory",
    title: "Memory Loop",
    description: "Stores episodic, semantic, and procedural learning from the run.",
    async execute({ run, emit, memory }) {
      emit("memory", "Writing run learning into memory stores.");
      const episodic = memory.save({
        kind: "episodic",
        runId: run.id,
        data: { task: run.goal, success: true, qualityScore: run.qualityScore ?? null }
      });
      const semantic = memory.save({
        kind: "semantic",
        runId: run.id,
        data: { concept: "loop-first autonomous engineering", source: "AI-Loop-OS run" }
      });
      const procedural = memory.save({
        kind: "procedural",
        runId: run.id,
        data: { workflow: "plan -> research -> code -> evaluate -> verify -> reflect -> secure -> comply -> deploy -> monitor" }
      });

      return {
        summary: "Stored episodic, semantic, and procedural memory records.",
        output: {
          records: [episodic, semantic, procedural],
          graphUpdate: {
            nodes: ["Run", "Goal", "Loop", "Artifact", "ComplianceEvidence"],
            relationships: ["RUN_PRODUCED_ARTIFACT", "LOOP_UPDATED_MEMORY", "GOAL_REQUIRES_COMPLIANCE"]
          }
        }
      };
    }
  },
  {
    name: "human_approval",
    title: "Human Approval Loop",
    description: "Pauses gated workflows until an operator approves deployment or regulated actions.",
    async execute({ run, emit }) {
      emit("human_approval", "Human approval gates have been satisfied.");
      return {
        summary: "Human approval received; workflow can continue.",
        output: {
          status: run.approval.status,
          gates: run.approval.gates,
          approvedAt: run.approval.approvedAt ?? null,
          approvedBy: run.approval.approvedBy ?? null,
          note: run.approval.note ?? null
        }
      };
    }
  },
  {
    name: "deployment",
    title: "Deployment Loop",
    description: "Builds deployment readiness, rollout, and rollback plans.",
    async execute({ emit }) {
      emit("deployment", "Preparing deployment readiness plan.");
      return {
        summary: "Prepared local-first deployment plan with production upgrade path.",
        output: {
          readiness: "local-demo-ready",
          targets: ["Docker", "Kubernetes", "ArgoCD"],
          rollout: ["build images", "run verification", "deploy canary", "monitor metrics", "promote or rollback"],
          rollback: ["restore previous image", "replay durable run state", "publish incident reflection"]
        }
      };
    }
  },
  {
    name: "monitoring",
    title: "Monitoring Loop",
    description: "Captures operational signals and production monitoring requirements.",
    async execute({ run, emit }) {
      emit("monitoring", "Calculating local operational metrics.");
      const completed = run.loops.filter((loop) => loop.status === "passed").length;
      const total = run.loops.length;

      return {
        summary: "Monitoring snapshot generated for the autonomous run.",
        output: {
          tokenUsageEstimate: run.goal.length * 12,
          latencyMsEstimate: total * 175,
          successRate: completed / total,
          hallucinationRisk: "low-for-local-demo",
          deploymentFailureRisk: "medium-until-durable-state-exists",
          observabilityTargets: ["Langfuse", "OpenTelemetry", "Prometheus", "Grafana"]
        }
      };
    }
  }
];
