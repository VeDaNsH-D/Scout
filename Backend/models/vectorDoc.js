const mongoose = require("mongoose");

const vectorSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    }
});

module.exports = mongoose.model("VectorDoc", vectorSchema);