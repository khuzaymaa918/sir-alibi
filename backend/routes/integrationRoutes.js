const express = require("express");
const router = express.Router();
const {
  createEmailDraft,
  scheduleFollowup,
} = require("../controllers/integrationController");

router.post("/send-apology-email", createEmailDraft);
router.post("/schedule-followup", scheduleFollowup);

module.exports = router;
