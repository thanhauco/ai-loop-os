import type { LlmMessage, LlmProvider } from "../types.js";

export interface OpenAiCompatibleProviderOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class OpenAiCompatibleProvider implements LlmProvider {
  readonly name: string;

  constructor(private readonly options: OpenAiCompatibleProviderOptions) {
    this.name = `openai-compatible:${options.model}`;
  }

  async complete(messages: LlmMessage[], opts?: { temperature?: number }): Promise<string> {
    const response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: this.options.model,
        messages,
        temperature: opts?.temperature ?? 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Model provider request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return payload.choices?.[0]?.message?.content?.trim() || "";
  }
}
