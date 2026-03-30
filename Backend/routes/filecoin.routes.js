const express = require("express");
const { getFilecoinURL } = require("../services/filecoinService");

const router = express.Router();

router.get("/filecoin/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!cid || typeof cid !== "string") {
            return res.status(400).json({ error: "Valid CID is required" });
        }

        const gatewayUrl = getFilecoinURL(cid);
        const response = await fetch(gatewayUrl);

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Failed to fetch Filecoin data",
                cid,
                gatewayUrl
            });
        }

        const raw = await response.text();
        let parsed;

        try {
            parsed = JSON.parse(raw);
        } catch (_) {
            parsed = raw;
        }

        return res.status(200).json({
            cid,
            gatewayUrl,
            data: parsed
        });
    } catch (error) {
        console.error("[FilecoinRoute] Error fetching CID:", error.message);
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
});

module.exports = router;
