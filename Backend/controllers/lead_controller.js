const fs = require("fs")

const Lead = require("../schemas/lead_schema")
const cleanLeads = require("../utils/csv_cleaner")
const { parseLeadFile } = require("../utils/csvParser")

/* GET ALL LEADS */
const getLeads = async (req, res) => {
    try {

        const leads = await Lead.find().sort({ createdAt: -1 })

        res.json({
            total: leads.length,
            leads
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: "Failed to fetch leads"
        })
    }
}


/* GET SINGLE LEAD */
const getLeadById = async (req, res) => {
    try {

        const lead = await Lead.findById(req.params.id)

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            })
        }

        res.json(lead)

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: "Error retrieving lead"
        })
    }
}


/* DELETE LEAD */
const deleteLead = async (req, res) => {
    try {

        const lead = await Lead.findByIdAndDelete(req.params.id)

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            })
        }

        res.json({
            message: "Lead deleted successfully"
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: "Failed to delete lead"
        })
    }
}



const uploadLeads = async (req, res) => {

    let filePath = null

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Lead file is required (CSV or Excel, field name: file)"
            })
        }

        filePath = req.file.path

        const rows = await parseLeadFile(filePath, req.file.mimetype, req.file.originalname)
        const cleanedLeads = cleanLeads(rows)

        if (cleanedLeads.length === 0) {
            return res.status(400).json({
                message: "No valid leads found in uploaded file"
            })
        }

        const emails = cleanedLeads.map((lead) => lead.email)
        const existingLeads = await Lead.find({
            email: { $in: emails }
        }).select("email")

        const existingEmailSet = new Set(
            existingLeads.map((lead) => lead.email.toLowerCase())
        )

        const newLeads = cleanedLeads.filter(
            (lead) => !existingEmailSet.has(lead.email.toLowerCase())
        )

        const insertedLeads = newLeads.length
            ? await Lead.insertMany(newLeads, { ordered: false })
            : []

        return res.json({
            totalParsed: rows.length,
            totalValid: cleanedLeads.length,
            inserted: insertedLeads.length,
            skippedExisting: cleanedLeads.length - insertedLeads.length,
            leads: insertedLeads
        })

    } catch (err) {

        console.error("Lead file upload failed:", err)

        return res.status(500).json({
            message: "Lead file processing failed",
            error: err.message
        })

    } finally {
        if (filePath) {
            fs.promises.unlink(filePath).catch(() => { })
        }
    }
}

/* ENROLL LEAD (from Chrome Extension) */
const enrollLead = async (req, res) => {
    try {
        const { name, role, company, email, profileUrl } = req.body

        if (!name) {
            return res.status(400).json({ message: "Lead name is required" })
        }

        // Check for duplicate by LinkedIn URL or email
        const query = []
        if (profileUrl) query.push({ linkedin: profileUrl })
        if (email) query.push({ email: email.toLowerCase() })

        if (query.length > 0) {
            const existing = await Lead.findOne({ $or: query })
            if (existing) {
                return res.json({
                    message: "Lead already exists",
                    lead: existing,
                    duplicate: true
                })
            }
        }

        const lead = await Lead.create({
            name,
            email: email || "",
            company: company || "",
            role: role || "",
            linkedin: profileUrl || "",
            status: "new"
        })

        res.status(201).json({
            message: "Lead enrolled successfully",
            lead,
            duplicate: false
        })
    } catch (err) {
        console.error("Enroll lead failed:", err)
        res.status(500).json({ message: "Failed to enroll lead", error: err.message })
    }
}

module.exports = {
    uploadLeads,
    getLeads,
    getLeadById,
    deleteLead,
    enrollLead
}
