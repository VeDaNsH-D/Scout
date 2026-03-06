const express = require("express");
const protect = require("../middleware/auth_middleware");
const { getCampaignAnalytics } = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/campaign", protect, getCampaignAnalytics);

module.exports = router;
