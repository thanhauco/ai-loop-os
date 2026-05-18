import type { LoopName, WorkflowDefinition } from "../types.js";

export const workflowRegistry: WorkflowDefinition[] = [
  {
    name: "build_feature",
    title: "Build Feature",
    description: "Full autonomous feature delivery from planning through monitoring.",
    loops: ["planner", "routing", "research", "tool_selection", "coding", "evaluation", "critic", "verification", "simulation", "reflection", "retry", "security", "compliance", "cost", "latency", "multi_agent_debate", "human_approval", "knowledge_graph", "learning", "memory", "deployment", "monitoring"],
    approvalGates: ["production_deployment", "regulated_data_access"],
    qualityGates: { minimumQualityScore: 85, blockOnCriticalSecurity: true }
  },
  {
    name: "bug_fix",
    title: "Bug Fix",
    description: "Focused defect analysis, implementation, regression verification, and learning.",
    loops: ["planner", "routing", "research", "tool_selection", "coding", "verification", "evaluation", "critic", "reflection", "learning", "memory", "monitoring"],
    qualityGates: { reproduceBeforeFix: true, regressionTestsRequired: true }
  },
  {
    name: "code_review",
    title: "Code Review",
    description: "Review-first workflow for quality, grounding, security, and compliance findings.",
    loops: ["research", "multi_agent_debate", "evaluation", "critic", "verification", "security", "compliance", "reflection", "knowledge_graph", "memory"],
    qualityGates: { findingsFirst: true, requireFileReferences: true }
  },
  {
    name: "security_scan",
    title: "Security Scan",
    description: "Security-led workflow with verification, compliance evidence, and memory updates.",
    loops: ["research", "tool_selection", "security", "verification", "simulation", "compliance", "cost", "reflection", "knowledge_graph", "memory"],
    qualityGates: { blockOnCriticalSecurity: true, requireMitigationForHigh: true }
  },
  {
    name: "release",
    title: "Release",
    description: "Release readiness, security, compliance, deployment, and monitoring workflow.",
    loops: ["verification", "evaluation", "critic", "security", "compliance", "simulation", "cost", "latency", "human_approval", "deployment", "monitoring", "reflection", "learning", "memory"],
    approvalGates: ["deployment_approval", "rollback_plan_acceptance"],
    qualityGates: { buildRequired: true, smokeTestRequired: true, rollbackRequired: true }
  }
];

export function findWorkflow(name: string | undefined): WorkflowDefinition {
  return workflowRegistry.find((workflow) => workflow.name === name) ?? workflowRegistry[0];
}

export function isKnownLoopName(value: string): value is LoopName {
  return workflowRegistry.some((workflow) => workflow.loops.includes(value as LoopName));
}
