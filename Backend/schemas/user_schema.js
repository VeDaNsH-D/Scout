const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // Basic user info
        full_name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password_hash: {
            type: String
        },

        // Company information
        company_name: {
            type: String,
            required: true
        },

        company_website: {
            type: String,
            default: null
        },

        // Role selection screen
        role: {
            type: String,
            enum: [
                "sdr_bdr",
                "account_executive",
                "full_cycle_account_executive",
                "marketing",
                "sales_leader",
                "founder_ceo",
                "operations",
                "it_support",
                "customer_success",
                "other"
            ]
        },

        // How they plan to use the platform
        use_cases: [
            {
                type: String,
                enum: [
                    "outbound",
                    "inbound",
                    "enrichment",
                    "deal_execution"
                ]
            }
        ],

        // Email integration
        email_provider: {
            type: String,
            enum: ["google", "outlook", "other"],
            default: null
        },

        email_connected: {
            type: Boolean,
            default: false
        },

        // onboarding progress
        onboarding_completed: {
            type: Boolean,
            default: false
        },

        // system fields
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);