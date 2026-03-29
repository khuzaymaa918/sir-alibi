async function buildCalendarEvent({ title, when, notes }) {
  return {
    title,
    when,
    notes: notes || "",
    status: "event_ready",
  };
}

module.exports = { buildCalendarEvent };
