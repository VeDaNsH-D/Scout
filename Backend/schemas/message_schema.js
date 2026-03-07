const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        lead_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead"
        },

        workflow_run_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowRun"
        },

        channel: {
            type: String,
            enum: ["email", "linkedin", "whatsapp"],
            default: "email"
        },

        direction: {
            type: String,
            enum: ["outgoing", "incoming"],
            default: "outgoing"
        },

        content: {
            type: String
        },

        status: {
            type: String,
            enum: ["sent", "failed", "received"],
            default: "sent"
        },

        messageId: {
            type: String,
            default: null
        },

        inReplyTo: {
            type: String,
            default: null
        },

        sent_at: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model("Message", messageSchema);
