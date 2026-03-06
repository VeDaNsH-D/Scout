const express = require("express");
const router = express.Router();

const { searchSimilar } = require("../services/vectorService");
const { generateResponse } = require("../services/llmService");

router.post("/chat", async (req, res) => {

    try {

        const { message } = req.body;

        // 1️⃣ retrieve relevant context
        const contextDocs = await searchSimilar(message);

        const context = contextDocs.join("\n");

        // 2️⃣ build RAG prompt
        const prompt = `
You are an AI assistant for the AuraReach platform.

Use the context below to answer the question.

Context:
${context}

Question:
${message}
`;

        // 3️⃣ generate response
        const response = await generateResponse(prompt);

        res.json({
            answer: response,
            contextUsed: contextDocs
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Chatbot failed"
        });

    }

});

module.exports = router;