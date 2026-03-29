const { buildDraftEmail } = require("../services/gmailService");
const { buildCalendarEvent } = require("../services/calendarService");

async function createEmailDraft(req, res) {
  try {
    const { to, subject, apology } = req.body;

    if (!subject || !apology) {
      return res.status(400).json({
        ok: false,
        error: "Missing subject or apology",
      });
    }

    const draft = await buildDraftEmail({ to, subject, apology });

    return res.json({
      ok: true,
      data: draft,
    });
  } catch (error) {
    console.error("createEmailDraft error:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to create email draft",
    });
  }
}

async function scheduleFollowup(req, res) {
  try {
    const { title, when, notes } = req.body;

    if (!title || !when) {
      return res.status(400).json({
        ok: false,
        error: "Missing title or when",
      });
    }

    const event = await buildCalendarEvent({ title, when, notes });

    return res.json({
      ok: true,
      data: event,
    });
  } catch (error) {
    console.error("scheduleFollowup error:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to schedule follow-up",
    });
  }
}

module.exports = {
  createEmailDraft,
  scheduleFollowup,
};
