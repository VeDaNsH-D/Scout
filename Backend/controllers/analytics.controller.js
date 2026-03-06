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
            failedRuns
        ] = await Promise.all([
            Lead.countDocuments(),
            Message.countDocuments({ channel: "email", status: "sent" }),
            Lead.countDocuments({ status: "replied" }),
            Lead.countDocuments({ status: "converted" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "running" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "completed" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "failed" })
        ]);

        return res.status(200).json({
            totalLeads,
            emailsSent,
            replies: repliedLeads,
            conversions: convertedLeads,
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
