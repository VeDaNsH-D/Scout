require("dotenv").config();

const mongoose = require("mongoose");
const { addDocument, searchSimilar } = require("./services/vectorService");

mongoose.connect(process.env.MONGO_URI);

async function test() {

    await addDocument("User Pallav created a cold outreach workflow");
    await addDocument("Leads can be uploaded using CSV files");

    const results = await searchSimilar("How do I upload leads?");

    console.log(results);

}

test();