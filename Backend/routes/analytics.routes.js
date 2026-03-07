const express = require("express");
const protect = require("../middleware/auth_middleware");
const { getCampaignAnalytics, getChartData } = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/campaign", protect, getCampaignAnalytics);
router.get("/chart-data", protect, getChartData);

module.exports = router;
