import { config } from "./config.js";

/** Lava forward target; OpenAI-compatible chat completions body. */
const LAVA_FORWARD_BASE = "https://api.lava.so/v1/forward";

/*
 * TODO (Lava / provider): If you switch upstream or Lava changes requirements:
 * - Ensure `?u=` is the correct encoded upstream chat URL for your provider.
 * - Confirm JSON field names (e.g. `max_tokens` vs provider-specific) match the forwarded API.
 * - Add `metadata` / `x-lava-metadata` query or headers if you need Lava billing metadata.
 */
const UPSTREAM_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

export type CallLLMParams = {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
};

function extractOpenAIAssistantText(data: unknown): string {
  if (!data || typeof data !== "object") {
    throw new Error("Lava response: expected JSON object");
  }
  const err = (data as { error?: { message?: string } }).error;
  if (err?.message) throw new Error(`Lava/provider error: ${err.message}`);

  const choices = (data as { choices?: { message?: { content?: unknown } }[] })
    .choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content === "string" && content.length > 0) return content;
  throw new Error("Lava response: missing choices[0].message.content");
}

export async function callLLM({
  model,
  systemPrompt,
  userPrompt,
  maxTokens,
  temperature,
}: CallLLMParams): Promise<string> {
  const key = config.lavaApiKey;

  const url = `${LAVA_FORWARD_BASE}?u=${encodeURIComponent(UPSTREAM_CHAT_COMPLETIONS_URL)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(`Lava gateway HTTP ${res.status}: ${bodyText}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error(`Lava response not JSON: ${bodyText.slice(0, 800)}`);
  }

  return extractOpenAIAssistantText(data);
}

function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  if (fence) return fence[1].trim();
  return trimmed;
}

/** Parse JSON from assistant output (may strip ``` fences). */
export function parseAssistantJson(raw: string): unknown {
  return JSON.parse(extractJsonBlock(raw));
}
