import { ZodError } from "zod";
import type { ZodType } from "zod";
import { callLLM, type CallLLMParams } from "./llm.js";
import { parseAssistantJson } from "./llm.js";

const JSON_ONLY_RETRY =
  "\n\nReturn JSON only. No markdown fences, no prose outside the JSON object.";

export type CallLLMJsonParams = Omit<CallLLMParams, "userPrompt">;

function isParseOrZodError(e: unknown): boolean {
  if (e instanceof SyntaxError) return true;
  if (e instanceof ZodError) return true;
  return false;
}

/**
 * Calls the LLM, parses assistant output as JSON, validates with `schema`.
 * On JSON parse or Zod failure, retries once with a JSON-only instruction appended to the user prompt.
 */
export async function callLLMJson<T>(
  schema: ZodType<T>,
  llm: CallLLMJsonParams,
  userPrompt: string
): Promise<T> {
  const attempt = async (up: string) => {
    const raw = await callLLM({ ...llm, userPrompt: up });
    const data = parseAssistantJson(raw);
    return schema.parse(data);
  };

  try {
    return await attempt(userPrompt);
  } catch (e) {
    if (!isParseOrZodError(e)) throw e;
    return await attempt(userPrompt + JSON_ONLY_RETRY);
  }
}
