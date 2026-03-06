const fs = require("fs")
const csv = require("csv-parser")

const Lead = require("../schemas/lead_schema")
const cleanLeads = require("../utils/csv_cleaner")

const uploadLeads = async (req, res) => {

    try {

        const results = []

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (data) => {
                results.push(data)
            })
            .on("end", async () => {

                // Clean the CSV data
                const cleanedLeads = cleanLeads(results)

                console.log("CLEANED LEADS:", cleanedLeads)

                // Insert into MongoDB
                await Lead.insertMany(cleanedLeads)

                // Delete uploaded file
                fs.unlinkSync(req.file.path)

                res.json({
                    total: cleanedLeads.length,
                    leads: cleanedLeads
                })
            })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: "CSV processing failed"
        })

    }
}

module.exports = {
    uploadLeads
}