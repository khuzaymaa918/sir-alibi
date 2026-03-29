const { createCalendarEvent } = require("../services/googleCalendarService");
const { googleTokensStore } = require("./googleController");

async function createEmailDraft(req, res) {
  try {
    const { failure_id, apology } = req.body;

    if (!failure_id || !apology || !apology.subject || !apology.body) {
      return res.status(400).json({
        ok: false,
        error: "Missing failure_id or apology fields",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("createEmailDraft error:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to create email draft",
    });
  }
}

function buildFollowupEvent({ followup, person_name }) {
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(12, 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return {
    summary: followup.calendar_title || "Follow up",
    description: followup.followup_message || "",
    start: {
      dateTime: start.toISOString(),
    },
    end: {
      dateTime: end.toISOString(),
    },
  };
}

async function scheduleFollowup(req, res) {
  try {
    const { failure_id, followup, person_name } = req.body;

    console.log("scheduleFollowup body:", JSON.stringify(req.body, null, 2));

    if (
      !failure_id ||
      !followup ||
      !followup.followup_timing ||
      !followup.followup_message ||
      !followup.calendar_title
    ) {
      return res.status(400).json({
        ok: false,
        error: "Missing followup scheduling fields",
      });
    }

    const tokens = googleTokensStore.defaultUser;

    if (!tokens) {
      return res.status(401).json({
        ok: false,
        error: "Google Calendar not connected",
      });
    }

    const event = buildFollowupEvent({ followup, person_name });
    const created = await createCalendarEvent(tokens, event);
    console.log("calendar event created:", created.id, created.htmlLink);

    return res.status(200).json({
      ok: true,
      eventId: created.id,
      htmlLink: created.htmlLink,
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
