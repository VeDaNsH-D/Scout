const VectorDoc = require("../models/vectorDoc");
const { createEmbedding } = require("./embeddingService");

async function addDocument(text) {

    const embedding = await createEmbedding(text);

    const doc = new VectorDoc({
        text,
        embedding
    });

    await doc.save();

}

async function searchSimilar(query) {

    const embedding = await createEmbedding(query);

    const results = await VectorDoc.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: embedding,
                numCandidates: 50,
                limit: 3
            }
        }
    ]);

    return results.map(r => r.text);
}

module.exports = {
    addDocument,
    searchSimilar
};