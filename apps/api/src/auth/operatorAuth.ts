import type { Request, Response } from "express";

export interface OperatorIdentity {
  id: string;
  role: "approver";
}

export function requireApprover(request: Request, response: Response): OperatorIdentity | undefined {
  const configuredToken = process.env.OPERATOR_TOKEN;
  const authorization = request.header("authorization");

  if (configuredToken && authorization !== `Bearer ${configuredToken}`) {
    response.status(401).json({ error: "Operator token is required." });
    return undefined;
  }

  const role = request.header("x-operator-role");
  if (role !== "approver") {
    response.status(403).json({ error: "Approver role is required." });
    return undefined;
  }

  return {
    id: request.header("x-operator-id")?.trim() || "local-operator",
    role: "approver"
  };
}
