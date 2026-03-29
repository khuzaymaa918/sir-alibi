function envStr(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : fallback;
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key]?.trim();
  if (v === undefined || v === "") return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function envFloat(key: string, fallback: number): number {
  const v = process.env[key]?.trim();
  if (v === undefined || v === "") return fallback;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Central env-driven settings. Override via `.env` / process env (no code edits).
 */
export const config = {
  /** Required for live Lava calls; validated when the key is read. */
  get lavaApiKey(): string {
    const key = process.env.LAVA_API_KEY?.trim();
    if (!key) {
      throw new Error(
        "LAVA_API_KEY is required — set it in your environment or .env"
      );
    }
    return key;
  },

  modelFast: envStr("MODEL_FAST", "gpt-4o-mini"),
  modelWrite: envStr("MODEL_WRITE", "gpt-4o-mini"),

  maxTokensResearch: envInt("MAX_TOKENS_RESEARCH", 400),
  maxTokensReason: envInt("MAX_TOKENS_REASON", 300),
  maxTokensWrite: envInt("MAX_TOKENS_WRITE", 600),

  temperature: envFloat("TEMPERATURE", 0.4),
} as const;

/** Safe snapshot for logging (does not read LAVA_API_KEY). */
export function getModelConfigSummary(): {
  modelFast: string;
  modelWrite: string;
  maxTokensResearch: number;
  maxTokensReason: number;
  maxTokensWrite: number;
  temperature: number;
} {
  return {
    modelFast: config.modelFast,
    modelWrite: config.modelWrite,
    maxTokensResearch: config.maxTokensResearch,
    maxTokensReason: config.maxTokensReason,
    maxTokensWrite: config.maxTokensWrite,
    temperature: config.temperature,
  };
}
