const express = require("express");
const router = express.Router();
const { analyzeLead } = require("../controllers/analyze_lead.controller");

/**
 * POST /api/analyze-lead
 * 
 * Orchestrates ML service calls to analyze a lead:
 * - Lead Scoring
 * - Insights Generation
 * - Send Time Optimization
 * - Workflow Strategy Generation
 * 
 * Request body:
 * {
 *   "lead_features": {
 *     "role": "CTO",
 *     "industry": "SaaS",
 *     "company_size": "medium",
 *     "lead_source": "Referral",
 *     "company_name": "TechCorp"
 *   }
 * }
 * 
 * Response:
 * {
 *   "lead_score": 0.75,
 *   "insights": ["..."],
 *   "best_send_day": "Tuesday",
 *   "best_send_hour": 10,
 *   "workflow_template": { ... }
 * }
 */
router.post("/", analyzeLead);

module.exports = router;
