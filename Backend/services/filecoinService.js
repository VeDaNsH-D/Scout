const lighthouse = require('@lighthouse-web3/sdk');

const getFilecoinURL = (cid) => `https://gateway.lighthouse.storage/ipfs/${cid}`;

const uploadJSONToFilecoin = async (data) => {
    try {
        const apiKey = process.env.LIGHTHOUSE_API_KEY;
        if (!apiKey) {
            console.error("LIGHTHOUSE_API_KEY missing");
            throw new Error("LIGHTHOUSE_API_KEY missing");
        }

        const response = await lighthouse.uploadText(
            JSON.stringify(data),
            apiKey,
            "workflow-log.json"
        );

        const cid = response?.data?.Hash;
        console.log("File uploaded to Filecoin. CID:", cid);

        return cid; // CID
    } catch (error) {
        console.error("Error uploading to Filecoin:", error.message);
        throw error;
    }
};

module.exports = { uploadJSONToFilecoin, getFilecoinURL };