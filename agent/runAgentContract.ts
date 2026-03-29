import crypto from "node:crypto";
import { z } from "zod";
import { incidentTypeSchema, alibiPolicySchema } from "./schemas.js";

export const relationshipTypeSchema = z.enum([
  "coworker",
  "manager",
  "direct_report",
  "friend",
  "partner",
  "other",
]);

export const channelPreferenceSchema = z.enum([
  "email",
  "text",
  "slack",
  "in_person",
  "unsure",
]);

export const RunAgentResponseSchema = z.object({
  runId: z.string(),
  ok: z.boolean(),
  status: z.enum(["ready_to_act", "needs_user_input"]),
  input: z.object({
    incident: z.string(),
    personName: z.string(),
    relationshipType: relationshipTypeSchema,
    channelPreference: channelPreferenceSchema,
  }),
  research: z.object({
    clarifyingQuestions: z.array(z.string()),
    giftIdeas: z.array(
      z.object({
        title: z.string(),
        priceRange: z.string(),
        whyItFits: z.string(),
        searchQuery: z.string(),
        purchaseLink: z.string().optional(),
      })
    ),
    followUpWindowDays: z.number(),
  }),
  reasoning: z.object({
    incidentType: incidentTypeSchema,
    severity: z.enum(["low", "med", "high"]),
    tone: z.enum(["humorous", "contrite", "brief"]),
    budgetRange: z.tuple([z.number(), z.number()]),
    alibiPolicy: alibiPolicySchema,
    plan: z.array(z.string()),
    risks: z.array(z.string()),
  }),
  writing: z.object({
    subject: z.string(),
    apologyMessage: z.string(),
    followUpMessage: z.string(),
    optionalLightFraming: z.string().optional(),
  }),
  actions: z.object({
    email: z.object({
      to: z.string().optional(),
      subject: z.string(),
      body: z.string(),
      sendEndpoint: z.literal("/api/send-apology-email"),
    }),
    followup: z.object({
      daysFromNow: z.number(),
      title: z.string(),
      notes: z.string(),
      scheduleEndpoint: z.literal("/api/schedule-followup"),
    }),
    giftLinks: z.array(z.string()),
  }),
  debug: z.object({
    usedFallback: z.boolean(),
    /** True when the run stopped for clarifiers (not a model/parse failure). */
    pausedForUserInput: z.boolean(),
    stepTimingsMs: z.object({
      research: z.number(),
      reason: z.number(),
      write: z.number(),
    }),
    logs: z.array(z.string()),
  }),
});

/** @deprecated Use `RunAgentResponseSchema` */
export const runAgentResponseSchema = RunAgentResponseSchema;

export type RunAgentResponse = z.infer<typeof RunAgentResponseSchema>;

/** Last-resort valid payload when validation or the agent pipeline fails. */
export function makeHardFallbackResponse(
  runId: string,
  incident: string
): RunAgentResponse {
  const writing = {
    subject: "Message",
    apologyMessage: "",
    followUpMessage: "",
  };

  return {
    runId,
    ok: true,
    status: "ready_to_act",
    input: {
      incident: incident || "",
      personName: "",
      relationshipType: "other",
      channelPreference: "unsure",
    },
    research: {
      clarifyingQuestions: [],
      giftIdeas: [],
      followUpWindowDays: 3,
    },
    reasoning: {
      incidentType: "other",
      severity: "med",
      tone: "contrite",
      budgetRange: [20, 50],
      alibiPolicy: "light_framing",
      plan: [],
      risks: [],
    },
    writing,
    actions: {
      email: {
        subject: writing.subject,
        body: writing.apologyMessage,
        sendEndpoint: "/api/send-apology-email",
      },
      followup: {
        daysFromNow: 3,
        title: writing.subject,
        notes: writing.followUpMessage,
        scheduleEndpoint: "/api/schedule-followup",
      },
      giftLinks: [],
    },
    debug: {
      usedFallback: true,
      pausedForUserInput: false,
      stepTimingsMs: { research: 0, reason: 0, write: 0 },
      logs: [],
    },
  };
}

/** @deprecated Use `makeHardFallbackResponse` */
export const buildMinimalSafeResponse = makeHardFallbackResponse;

/** Ensures output matches the public contract; on parse failure merges a hard fallback and logs. */
export function validateFinalResponse(response: unknown): RunAgentResponse {
  const parsed = RunAgentResponseSchema.safeParse(response);
  if (parsed.success) return parsed.data;

  const errLine = `validateFinalResponse: repair — ${parsed.error.message}`;
  const candidate = response as Partial<RunAgentResponse> | null | undefined;
  const base = makeHardFallbackResponse(
    typeof candidate?.runId === "string"
      ? candidate.runId
      : crypto.randomUUID(),
    typeof candidate?.input?.incident === "string"
      ? candidate.input.incident
      : ""
  );
  base.debug.usedFallback = true;
  const priorLogs = candidate?.debug?.logs ?? [];
  base.debug.logs = [...priorLogs, ...base.debug.logs, errLine];
  if (candidate?.debug?.pausedForUserInput !== undefined) {
    base.debug.pausedForUserInput = candidate.debug.pausedForUserInput;
  }

  const ci = candidate?.input;
  if (ci && typeof ci === "object") {
    if (ci.personName !== undefined) base.input.personName = ci.personName;
    if (ci.relationshipType !== undefined) {
      base.input.relationshipType = ci.relationshipType;
    }
    if (ci.channelPreference !== undefined) {
      base.input.channelPreference = ci.channelPreference;
    }
  }

  return RunAgentResponseSchema.parse(base);
}
