async function runAlibiAgent(input) {
  return {
    input,
    steps: [
      {
        tool: "research_person",
        result: {
          summary: `${input.name} is a ${input.relationship}`,
        },
      },
      {
        tool: "assess_damage",
        result: {
          severity: 68,
        },
      },
      {
        tool: "build_alibi_narrative",
        result: {
          explanation: "I lost track of the date during a hectic stretch.",
        },
      },
      {
        tool: "draft_apology",
        result: {
          text: `Hey ${input.name}, I am really sorry for missing this.`,
        },
      },
      {
        tool: "recommend_gift",
        result: {
          suggestion: "Coffee and a handwritten note.",
        },
      },
      {
        tool: "schedule_followup",
        result: {
          when: "3 days from now",
          action: "Check in again",
        },
      },
    ],
    final: {
      severity: 68,
      explanation: "I lost track of the date during a hectic stretch.",
      apology: `Hey ${input.name}, I am really sorry for missing this.`,
      gift: "Coffee and a handwritten note.",
      followup: {
        when: "3 days from now",
        action: "Check in again",
      },
    },
  };
}

module.exports = { runAlibiAgent };
