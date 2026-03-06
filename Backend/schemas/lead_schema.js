const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },

        email: {
            type: String,
            required: true
        },

        company: {
            type: String
        },

        role: {
            type: String
        },
        
        industry: {
            type: String
        },

        company_size: {
            type: String
        },

        growth_rate: {
            type: Number
        },

        seniority: {
            type: String
        },

        lead_source: {
            type: String
        },
        
        linkedin: {
            type: String
        },

        status: {
            type: String,
            enum: ["new", "contacted", "replied", "converted"],
            default: "new"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Lead", leadSchema);