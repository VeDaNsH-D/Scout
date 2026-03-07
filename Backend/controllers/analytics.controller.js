const Lead = require("../schemas/lead_schema");
const Message = require("../schemas/message_schema");
const WorkflowRun = require("../schemas/workflow_run_schema");

const getCampaignAnalytics = async (req, res, next) => {
    try {
        const { workflowId } = req.query;

        if (workflowId && !/^[a-f\d]{24}$/i.test(workflowId)) {
            return res.status(400).json({ message: "Invalid workflowId" });
        }

        const workflowRunFilter = workflowId ? { workflow_id: workflowId } : {};

        const [
            totalLeads,
            emailsSent,
            repliedLeads,
            convertedLeads,
            runningRuns,
            completedRuns,
            failedRuns,
            averageScoreResult
        ] = await Promise.all([
            Lead.countDocuments(),
            Message.countDocuments({
                channel: "email",
                status: "sent",
                $or: [
                    { direction: "outgoing" },
                    { direction: { $exists: false } }
                ]
            }),
            Lead.countDocuments({ status: "replied" }),
            Lead.countDocuments({ status: "converted" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "running" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "completed" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "failed" }),
            Lead.aggregate([
                {
                    $match: {
                        lead_score: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgLeadScore: { $avg: "$lead_score" }
                    }
                }
            ])
        ]);

        const averageLeadScore = Number(averageScoreResult?.[0]?.avgLeadScore || 0);
        const averageLeadScorePct = Number((averageLeadScore * 100).toFixed(1));
        const responseRate = emailsSent > 0
            ? Number(((repliedLeads / emailsSent) * 100).toFixed(1))
            : 0;

        return res.status(200).json({
            totalLeads,
            emailsSent,
            replies: repliedLeads,
            conversions: convertedLeads,
            responseRate,
            averageLeadScore,
            averageLeadScorePct,
            workflowRuns: {
                running: runningRuns,
                completed: completedRuns,
                failed: failedRuns
            }
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCampaignAnalytics
};
