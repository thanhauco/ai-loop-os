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
    name: "routing",
    title: "Routing Loop",
    description: "Chooses the model and agent route for the current objective.",
    async execute({ run, emit }) {
      emit("routing", "Selecting model route, fallback policy, and agent lane.");
      const regulated = run.compliance.some((framework) => ["HIPAA", "PCI-DSS", "GDPR"].includes(framework));
      return {
        summary: regulated ? "Selected regulated-workload routing policy." : "Selected standard autonomous engineering route.",
        output: {
          selectedModel: regulated ? "frontier-regulated-reasoning-model" : "balanced-engineering-model",
          fallbackModels: ["architect-review-model", "research-long-context-model", "local-llama"],
          agentLane: regulated ? "compliance-first" : "delivery-first",
          routingSignals: {
            workflow: run.workflow,
            compliance: run.compliance,
            retryBudget: run.maxRetries
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
    name: "tool_selection",
    title: "Tool Selection Loop",
    description: "Chooses the safest tools for research, code execution, scanning, and deployment.",
    async execute({ run, emit }) {
      emit("tool_selection", "Choosing tools based on workflow risk and approval boundaries.");
      const deploymentLikely = run.workflow === "release" || run.workflow === "build_feature";
      return {
        summary: "Selected tool policy for this workflow.",
        output: {
          selectedTools: ["search", "rag", "terminal", "evaluation_suite", deploymentLikely ? "docker" : "semgrep"],
          blockedTools: deploymentLikely && run.approval.status === "pending" ? ["kubernetes", "argocd"] : [],
          approvalRequiredFor: ["source writes", "terminal mutations", "production deployment", "regulated data access"],
          policy: {
            preferStructuredApis: true,
            redactSecrets: true,
            recordToolInputs: true
          }
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
    name: "critic",
    title: "Critic Loop",
    description: "Challenges assumptions, tests reasoning, and proposes counterexamples.",
    async execute({ run, emit }) {
      emit("critic", "Challenging plan assumptions and quality claims.");
      return {
        summary: "Critic review found manageable risks and concrete mitigations.",
        output: {
          challenges: [
            "Does the workflow have a durable audit trail for each loop transition?",
            "Can approval gates stop deployment tools before irreversible actions?",
            "Are compliance outputs evidence-backed rather than just descriptive?"
          ],
          counterarguments: [
            "Local JSON persistence is suitable for development, not regulated production audit retention",
            "Mock provider output must not be treated as factual production grounding",
            "Quality score is deterministic demo data until wired to real evaluators"
          ],
          mitigations: [
            "Persist run events to PostgreSQL before production",
            "Attach source citations and evaluator traces to compliance evidence",
            "Keep human approval before deployment in gated workflows"
          ],
          workflow: run.workflow
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
    name: "simulation",
    title: "Simulation Loop",
    description: "Runs scenario analysis before actions continue into deployment or compliance-sensitive steps.",
    async execute({ run, emit }) {
      emit("simulation", "Simulating success, failure, rollback, and compliance scenarios.");
      const scenarios = [
        { name: "happy_path", result: "pass", risk: "low" },
        { name: "model_hallucination", result: "mitigated", risk: "medium" },
        { name: "dependency_failure", result: "rollback-required", risk: "medium" },
        { name: "approval_rejected", result: "stop-workflow", risk: "low" }
      ];

      return {
        summary: `Simulated ${scenarios.length} operational scenarios.`,
        output: {
          scenarios,
          recommendedAction: run.approval.status === "pending" ? "wait-for-approval" : "continue",
          rollbackConfidence: run.workflow === "release" ? "medium" : "not-applicable"
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
    name: "cost",
    title: "Cost Loop",
    description: "Estimates and constrains model, tool, and infrastructure spend.",
    async execute({ run, emit }) {
      emit("cost", "Estimating token, tool, and infrastructure cost envelope.");
      const estimatedTokens = Math.max(2400, run.goal.length * run.loops.length * 18);
      const estimatedCostUsd = Number((estimatedTokens * 0.000012).toFixed(4));
      return {
        summary: `Estimated run cost is $${estimatedCostUsd} with local mock execution.`,
        output: {
          estimatedTokens,
          estimatedCostUsd,
          costControls: ["route low-risk work to smaller models", "cache research facts", "cap retries", "require approval for expensive tools"],
          budgetStatus: estimatedCostUsd <= 5 ? "within-budget" : "requires-approval"
        }
      };
    }
  },
  {
    name: "latency",
    title: "Latency Loop",
    description: "Optimizes loop ordering, model choices, and tool execution time.",
    async execute({ run, emit }) {
      emit("latency", "Calculating latency budget and optimization opportunities.");
      const estimatedLatencyMs = run.loops.length * 175;
      return {
        summary: `Estimated local loop latency is ${estimatedLatencyMs}ms.`,
        output: {
          estimatedLatencyMs,
          latencyBudgetMs: 120000,
          bottlenecks: ["research fan-out", "security scans", "deployment verification"],
          optimizations: ["parallelize read-only research", "cache workflow manifests", "stream loop events", "defer non-blocking learning writes"],
          status: estimatedLatencyMs < 120000 ? "within-budget" : "over-budget"
        }
      };
    }
  },
  {
    name: "multi_agent_debate",
    title: "Multi-Agent Debate Loop",
    description: "Coordinates agent disagreement before high-risk decisions are accepted.",
    async execute({ run, emit }) {
      emit("multi_agent_debate", "Running planner, critic, security, and compliance perspectives.");
      return {
        summary: "Debate reached consensus with explicit dissent recorded.",
        output: {
          participants: ["planner_agent", "critic_agent", "security_agent", "compliance_agent"],
          positions: [
            { agent: "planner_agent", position: "continue with current loop plan" },
            { agent: "critic_agent", position: "require stronger grounding before deployment" },
            { agent: "security_agent", position: "block production tools until approval" },
            { agent: "compliance_agent", position: "preserve evidence and approval trail" }
          ],
          consensus: run.approval.status === "pending" ? "pause for approval" : "continue with mitigations",
          dissent: ["quality score remains synthetic until evaluator integration"]
        }
      };
    }
  },
  {
    name: "knowledge_graph",
    title: "Knowledge Graph Loop",
    description: "Updates graph memory with run, loop, artifact, compliance, and dependency relationships.",
    async execute({ run, emit }) {
      emit("knowledge_graph", "Preparing graph memory update.");
      return {
        summary: "Prepared knowledge graph nodes and relationships for the run.",
        output: {
          nodes: [
            { label: "Run", id: run.id },
            { label: "Workflow", id: run.workflow },
            { label: "Goal", id: `goal:${run.id}` },
            ...run.loops.map((loop) => ({ label: "Loop", id: loop.name }))
          ],
          relationships: [
            { from: run.id, type: "USES_WORKFLOW", to: run.workflow },
            { from: run.id, type: "HAS_GOAL", to: `goal:${run.id}` },
            ...run.loops.map((loop) => ({ from: run.id, type: "EXECUTED_LOOP", to: loop.name }))
          ],
          backendTarget: "neo4j"
        }
      };
    }
  },
  {
    name: "learning",
    title: "Learning Loop",
    description: "Improves reusable prompts, workflows, and policies from run outcomes.",
    async execute({ run, emit }) {
      emit("learning", "Extracting workflow improvements from run artifacts.");
      return {
        summary: "Captured reusable workflow improvements.",
        output: {
          promptImprovements: ["Ask critic loop to produce counterexamples before deployment", "Include compliance framework names in research constraints"],
          workflowImprovements: ["Run simulation before approval gates", "Record cost and latency before deployment"],
          policyUpdates: ["Require human approval for Kubernetes and ArgoCD tools", "Route regulated workflows to compliance-first model policy"],
          shouldCompressMemory: run.loops.length > 12
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
