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