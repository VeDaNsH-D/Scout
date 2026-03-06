/**
 * Analyze Lead Controller
 * Orchestrates ML service calls and returns unified analysis response.
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

/**
 * Analyze a lead by orchestrating calls to ML services.
 * 
 * Flow:
 * 1. Call Lead Scoring Model
 * 2. Call Insight Engine
 * 3. Call Send-Time Optimization Model
 * 4. Call Workflow Strategy Generator
 * 5. Combine and return unified response
 */
const analyzeLead = async (req, res, next) => {
    try {
        const { lead_features } = req.body;

        if (!lead_features) {
            return res.status(400).json({
                message: "lead_features is required"
            });
        }

        // Normalize lead features with defaults
        const normalizedFeatures = {
            role: lead_features.role || "Unknown",
            industry: lead_features.industry || "Unknown",
            company_size: lead_features.company_size || "medium",
            lead_source: lead_features.lead_source || "Website",
            company_name: lead_features.company_name || "Unknown",
            timezone_region: lead_features.timezone_region || "US",
            past_open_rate: lead_features.past_open_rate || 0.5,
            past_reply_rate: lead_features.past_reply_rate || 0.2
        };

        // Try to call the unified ML endpoint first (most efficient)
        try {
            const mlResponse = await fetch(`${ML_SERVICE_URL}/api/analyze-lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lead_features: normalizedFeatures })
            });

            if (mlResponse.ok) {
                const data = await mlResponse.json();
                return res.status(200).json(data);
            }
        } catch (mlError) {
            console.log("[AnalyzeLead] ML service unavailable, using fallback orchestration");
        }

        // Fallback: Orchestrate individual ML calls
        let lead_score = 0.5;
        let insights = [];
        let best_send_day = "Tuesday";
        let best_send_hour = 10;
        let workflow_template = null;

        // Step 1: Lead Scoring
        try {
            const scoreResponse = await fetch(`${ML_SERVICE_URL}/api/lead-score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizedFeatures)
            });
            if (scoreResponse.ok) {
                const data = await scoreResponse.json();
                lead_score = data.lead_score;
            }
        } catch (e) {
            console.log("[AnalyzeLead] Lead scoring failed, using default");
        }

        // Step 2: Insights
        try {
            const insightsResponse = await fetch(
                `${ML_SERVICE_URL}/api/insights?lead_score=${lead_score}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(normalizedFeatures)
                }
            );
            if (insightsResponse.ok) {
                const data = await insightsResponse.json();
                insights = data.insights;
            }
        } catch (e) {
            console.log("[AnalyzeLead] Insights generation failed, using defaults");
            insights = generateFallbackInsights(normalizedFeatures, lead_score);
        }

        // Step 3: Send Time Optimization
        try {
            const sendTimeResponse = await fetch(`${ML_SERVICE_URL}/api/send-time`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizedFeatures)
            });
            if (sendTimeResponse.ok) {
                const data = await sendTimeResponse.json();
                best_send_day = data.best_send_day;
                best_send_hour = data.best_send_hour;
            }
        } catch (e) {
            console.log("[AnalyzeLead] Send time prediction failed, using defaults");
        }

        // Step 4: Workflow Strategy
        try {
            const workflowResponse = await fetch(`${ML_SERVICE_URL}/api/workflow-strategy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...normalizedFeatures,
                    lead_score,
                    best_send_day,
                    best_send_hour,
                    insights
                })
            });
            if (workflowResponse.ok) {
                workflow_template = await workflowResponse.json();
            }
        } catch (e) {
            console.log("[AnalyzeLead] Workflow generation failed, using fallback");
            workflow_template = generateFallbackWorkflow(lead_score, best_send_day, best_send_hour);
        }

        // If insights are still empty, generate fallback
        if (insights.length === 0) {
            insights = generateFallbackInsights(normalizedFeatures, lead_score);
        }

        // If workflow is still null, generate fallback
        if (!workflow_template) {
            workflow_template = generateFallbackWorkflow(lead_score, best_send_day, best_send_hour);
        }

        return res.status(200).json({
            lead_score,
            insights,
            best_send_day,
            best_send_hour,
            workflow_template
        });

    } catch (error) {
        console.error("[AnalyzeLead] Error:", error);
        return next(error);
    }
};

/**
 * Generate fallback insights when ML service is unavailable
 */
function generateFallbackInsights(lead, score) {
    const insights = [];

    // Role-based
    const roleInsights = {
        "CTO": "Technical decision-makers respond well to ROI and efficiency metrics.",
        "CEO": "Executive messaging should focus on strategic business impact.",
        "Marketing Manager": "Marketing leads appreciate data-driven personalization.",
        "VP Sales": "Sales leaders value pipeline and revenue growth messaging."
    };
    if (roleInsights[lead.role]) {
        insights.push(roleInsights[lead.role]);
    }

    // Industry-based
    const industryInsights = {
        "AI": "AI companies respond well to innovation and cutting-edge technology messaging.",
        "SaaS": "SaaS companies value scalability and integration capabilities.",
        "Finance": "Financial sector prioritizes security and compliance messaging."
    };
    if (industryInsights[lead.industry]) {
        insights.push(industryInsights[lead.industry]);
    }

    // Source-based
    const sourceInsights = {
        "Referral": "Referral leads have higher trust; prioritize early outreach.",
        "Website": "Website leads showed intent; reference their browsing behavior.",
        "LinkedIn": "LinkedIn leads respond well to professional networking tone."
    };
    if (sourceInsights[lead.lead_source]) {
        insights.push(sourceInsights[lead.lead_source]);
    }

    // Score-based
    if (score >= 0.7) {
        insights.push("High-priority lead - recommend immediate personalized outreach.");
    } else if (score >= 0.4) {
        insights.push("Medium-priority lead - standard nurturing sequence recommended.");
    } else {
        insights.push("Lower-priority lead - consider automated drip campaign.");
    }

    return insights;
}

/**
 * Generate fallback workflow when ML service is unavailable
 */
function generateFallbackWorkflow(score, sendDay, sendHour) {
    const delayMultiplier = score >= 0.7 ? 1 : score >= 0.4 ? 1.5 : 2;
    const workflowName = score >= 0.7 
        ? "High-Priority Outreach Sequence"
        : score >= 0.4 
            ? "Standard Nurturing Sequence"
            : "Long-Term Drip Campaign";

    return {
        workflow_name: workflowName,
        steps: [
            {
                step_number: 1,
                action: "send_email",
                email_type: "cold_email",
                send_day: sendDay,
                send_hour: sendHour
            },
            {
                step_number: 2,
                action: "wait",
                delay_days: Math.round(2 * delayMultiplier)
            },
            {
                step_number: 3,
                action: "send_email",
                email_type: "followup_1",
                condition: "if_no_reply"
            },
            {
                step_number: 4,
                action: "wait",
                delay_days: Math.round(3 * delayMultiplier)
            },
            {
                step_number: 5,
                action: "send_email",
                email_type: "followup_2",
                condition: "if_no_reply"
            },
            {
                step_number: 6,
                action: "wait",
                delay_days: Math.round(4 * delayMultiplier)
            },
            {
                step_number: 7,
                action: "send_email",
                email_type: "final_followup",
                condition: "if_no_reply"
            }
        ]
    };
}

module.exports = {
    analyzeLead
};
