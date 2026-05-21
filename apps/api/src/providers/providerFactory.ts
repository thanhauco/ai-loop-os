import type { LlmProvider } from "../types.js";
import { MockLlmProvider } from "./mockLlmProvider.js";
import { OpenAiCompatibleProvider } from "./openAiCompatibleProvider.js";

export function createLlmProvider(env: NodeJS.ProcessEnv = process.env): LlmProvider {
  const provider = env.LLM_PROVIDER ?? "mock";

  if (provider === "openai-compatible") {
    const apiKey = env.LLM_API_KEY;
    const baseUrl = env.LLM_BASE_URL ?? "https://api.openai.com/v1";
    const model = env.LLM_MODEL ?? "gpt-4.1-mini";

    if (!apiKey) {
      throw new Error("LLM_API_KEY is required when LLM_PROVIDER=openai-compatible.");
    }

    return new OpenAiCompatibleProvider({ apiKey, baseUrl, model });
  }

  return new MockLlmProvider();
}
