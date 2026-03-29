const { runAlibiAgent } = require("../services/runService");

async function runAgent(req, res) {
  try {
    const input = req.body;

    if (!input || !input.name || !input.relationship || !input.failure_type) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields",
      });
    }

    const result = await runAlibiAgent(input);

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error("runAgent error:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to run agent",
    });
  }
}

module.exports = { runAgent };
