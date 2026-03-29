import { getModelConfigSummary } from "./config.js";
import { RunAgentResponseSchema } from "./runAgentContract.js";
import { runAlibiAgent } from "./runAlibiAgent.js";

const TEST_INPUTS = [
  "I forgot my partner's anniversary.",
  "I missed a meeting with my manager.",
  "Forgot our anniversary dinner reservation; partner was upset and went home early.",
  "Made a joke about their family at a party; they have not texted in two days.",
  "Promised to help move apartments but bailed last minute citing work.",
];

function printRuntimeModelConfig() {
  const c = getModelConfigSummary();
  console.log("LLM config (from env / defaults):");
  console.log(
    `  MODEL_FAST (research, reason): ${c.modelFast} | max_tokens: ${c.maxTokensResearch} / ${c.maxTokensReason}`
  );
  console.log(
    `  MODEL_WRITE: ${c.modelWrite} | max_tokens: ${c.maxTokensWrite}`
  );
  console.log(`  TEMPERATURE (all steps): ${c.temperature}`);
}

async function main() {
  printRuntimeModelConfig();

  if (TEST_INPUTS.length !== 5) {
    throw new Error(`Expected 5 test cases, got ${TEST_INPUTS.length}`);
  }

  for (let i = 0; i < TEST_INPUTS.length; i++) {
    const input = TEST_INPUTS[i];
    console.log("\n" + "=".repeat(60));
    console.log(`Test ${i + 1}/${TEST_INPUTS.length}`);
    console.log("Input:", input);
    console.log("-".repeat(60));

    const out = await runAlibiAgent(input);
    RunAgentResponseSchema.parse(out);

    console.log(
      `telemetry: usedFallback=${out.debug.usedFallback} pausedForUserInput=${out.debug.pausedForUserInput} status=${out.status} incidentType=${out.reasoning.incidentType}`
    );

    const json = JSON.stringify(out, null, 2);
    console.log("--- final JSON ---");
    console.log(json);

    RunAgentResponseSchema.parse(JSON.parse(json));
    console.log("RunAgentResponseSchema.parse: OK (object + round-trip)");
  }

  console.log("\nAll 5 cases: RunAgentResponseSchema.parse succeeded.");
}

main();
