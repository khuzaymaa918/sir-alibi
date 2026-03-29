const express = require("express");
const router = express.Router();
const {
  googleAuthStart,
  googleAuthCallback,
  authStatus,
  createEmailDraft,
  scheduleFollowup,
  sendTremendousGift,
} = require("../controllers/integrationController");

router.get("/auth/google/start", googleAuthStart);
router.get("/auth/google/callback", googleAuthCallback);
router.get("/auth/status", authStatus);

router.post("/send-apology-email", createEmailDraft);
router.post("/schedule-followup", scheduleFollowup);
router.post("/send-gift", sendTremendousGift);

module.exports = router;
