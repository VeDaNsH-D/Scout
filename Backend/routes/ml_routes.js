const express = require('express');
const router = express.Router();
// Node 18+ has native fetch

const ML_BASE_URL = process.env.ML_API_URL || 'http://127.0.0.1:5000/api/ml';

router.post('/analyze-lead', async (req, res, next) => {
    try {
        const { lead_features } = req.body;
        
        if (!lead_features) {
            return res.status(400).json({ error: 'lead_features is required' });
        }

        console.log('[ML Orchestrator] Analyzing lead...', lead_features);

        // 1. Call Lead Scoring Model
        let lead_score = 0;
        try {
            const scoreRes = await fetch(`${ML_BASE_URL}/score-lead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_features })
            });
            const scoreData = await scoreRes.json();
            lead_score = scoreData.lead_score || 0;
        } catch (error) {
            console.error('[ML Orchestrator] Failed to get lead score:', error.message);
        }

        // 2. Call Insight Engine
        let insights = [];
        try {
            const insightsRes = await fetch(`${ML_BASE_URL}/insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_features, lead_score })
            });
            const insightsData = await insightsRes.json();
            insights = insightsData.insights || [];
        } catch (error) {
            console.error('[ML Orchestrator] Failed to get insights:', error.message);
        }

        // 3. Call Send-Time Optimization Model
        let best_send_day = 'Tuesday';
        let best_send_hour = 10;
        try {
            const timeRes = await fetch(`${ML_BASE_URL}/best-send-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_features })
            });
            const timeData = await timeRes.json();
            best_send_day = timeData.best_send_day || best_send_day;
            best_send_hour = timeData.best_send_hour || best_send_hour;
        } catch (error) {
            console.error('[ML Orchestrator] Failed to get best send time:', error.message);
        }

        // 4. Call Workflow Strategy Generator
        let workflow_template = {};
        try {
            const wfRes = await fetch(`${ML_BASE_URL}/workflow-strategy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_features,
                    lead_score,
                    best_send_day,
                    best_send_hour,
                    insights
                })
            });
            const wfData = await wfRes.json();
            workflow_template = wfData.workflow_template || {};
        } catch (error) {
            console.error('[ML Orchestrator] Failed to get workflow template:', error.message);
            // Fallback
            workflow_template = {
                workflow_name: "Fallback Outreach",
                steps: [
                    { step_number: 1, action: "send_email", email_type: "cold_email", send_day: best_send_day, send_hour: best_send_hour }
                ]
            };
        }

        // Combine outputs
        const unifiedResponse = {
            lead_score,
            insights,
            best_send_day,
            best_send_hour,
            workflow_template
        };

        return res.status(200).json(unifiedResponse);
        
    } catch (error) {
        console.error('[ML Orchestrator] General error:', error);
        next(error);
    }
});

module.exports = router;
