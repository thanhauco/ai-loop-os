import type { LlmMessage, LlmProvider } from "../types.js";

export class MockLlmProvider implements LlmProvider {
  readonly name = "mock-local-loop-model";

  async complete(messages: LlmMessage[]): Promise<string> {
    const userMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
    const normalized = userMessage.replace(/\s+/g, " ").trim();

    return `Local deterministic response for: ${normalized.slice(0, 180)}`;
  }
}
