async function buildDraftEmail({ to, subject, apology }) {
  return {
    to: to || "recipient@example.com",
    subject,
    body: apology,
    status: "draft_ready",
  };
}

module.exports = { buildDraftEmail };
