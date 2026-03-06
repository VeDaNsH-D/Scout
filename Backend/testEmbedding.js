require("dotenv").config();

const { createEmbedding } = require("./services/embeddingService");

async function test() {
    const text = "Cold outreach workflow for fintech leads";

    const embedding = await createEmbedding(text);

    console.log("Embedding length:", embedding.length);
    console.log(embedding.slice(0, 10));
}

test();