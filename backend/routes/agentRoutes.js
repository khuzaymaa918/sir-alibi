const express = require("express");
const router = express.Router();
const { runAgent } = require("../controllers/agentController");

router.post("/run-agent", runAgent);

module.exports = router;
