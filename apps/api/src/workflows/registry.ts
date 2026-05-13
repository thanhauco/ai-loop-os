import type { LoopName, WorkflowDefinition } from "../types.js";

export const workflowRegistry: WorkflowDefinition[] = [
  {
    name: "build_feature",
    title: "Build Feature",
    description: "Full autonomous feature delivery from planning through monitoring.",
    loops: ["planner", "research", "coding", "evaluation", "verification", "reflection", "retry", "security", "compliance", "memory", "deployment", "monitoring"],
    approvalGates: ["production_deployment", "regulated_data_access"],
    qualityGates: { minimumQualityScore: 85, blockOnCriticalSecurity: true }
  },
  {
    name: "bug_fix",
    title: "Bug Fix",
    description: "Focused defect analysis, implementation, regression verification, and learning.",
    loops: ["planner", "research", "coding", "verification", "evaluation", "reflection", "memory", "monitoring"],
    qualityGates: { reproduceBeforeFix: true, regressionTestsRequired: true }
  },
  {
    name: "code_review",
    title: "Code Review",
    description: "Review-first workflow for quality, grounding, security, and compliance findings.",
    loops: ["research", "evaluation", "verification", "security", "compliance", "reflection", "memory"],
    qualityGates: { findingsFirst: true, requireFileReferences: true }
  },
  {
    name: "security_scan",
    title: "Security Scan",
    description: "Security-led workflow with verification, compliance evidence, and memory updates.",
    loops: ["research", "security", "verification", "compliance", "reflection", "memory"],
    qualityGates: { blockOnCriticalSecurity: true, requireMitigationForHigh: true }
  },
  {
    name: "release",
    title: "Release",
    description: "Release readiness, security, compliance, deployment, and monitoring workflow.",
    loops: ["verification", "evaluation", "security", "compliance", "deployment", "monitoring", "reflection", "memory"],
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
