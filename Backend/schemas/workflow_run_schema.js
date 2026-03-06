const mongoose = require("mongoose");

const workflowRunSchema = new mongoose.Schema(
    {
        workflow_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workflow",
            required: true
        },

        lead_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead",
            required: true
        },

        current_node: {
            type: String
        },

        status: {
            type: String,
            enum: ["running", "completed", "failed", "stopped"],
            default: "running"
        },

        started_at: {
            type: Date,
            default: Date.now
        },

        completed_at: {
            type: Date
        }
    }
);

module.exports = mongoose.model("WorkflowRun", workflowRunSchema);