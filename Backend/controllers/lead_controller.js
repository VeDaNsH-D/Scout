const fs = require("fs")

const Lead = require("../schemas/lead_schema")
const Workflow = require("../schemas/workflow_schema")
const cleanLeads = require("../utils/csv_cleaner")
const { parseLeadFile } = require("../utils/csvParser")

const ML_BASE_URL = process.env.ML_API_URL || 'http://127.0.0.1:5001/api/ml'

const DEFAULT_EXTENSION_EMAIL_DOMAIN = "aurareach.local"

const normalizeEmail = (email) => {
    if (!email) return ""
    return String(email).trim().toLowerCase()
}

const createDeterministicHash = (value = "") => {
    let hash = 0
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash).toString(36)
}

const slugify = (value = "") => String(value)
    .toLowerCase()
    .replace(/https?:\/\/(www\.)?/g, "")
    .replace(/linkedin\.com\/in\//g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")

const buildFallbackEmail = ({ name = "", profileUrl = "" }) => {
    const profileSlug = slugify(profileUrl)
    const nameSlug = slugify(name)
    const localSeed = profileSlug || nameSlug || "lead"
    const localPart = localSeed.slice(0, 40) || "lead"
    const hash = createDeterministicHash(`${name}|${profileUrl}`)
    return `autogen.${localPart}.${hash}@${DEFAULT_EXTENSION_EMAIL_DOMAIN}`
}

const normalizeOrFallbackEmail = ({ email = "", name = "", profileUrl = "" }) => {
    const normalized = normalizeEmail(email)
    return normalized || buildFallbackEmail({ name, profileUrl })
}

const csvEscape = (value) => {
    if (value == null) return ""
    const str = String(value)
    if (/[,"\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

/* GET ALL LEADS */
const getLeads = async (req, res) => {
    try {

        const leads = await Lead.aggregate([
            {
                $addFields: {
                    scoreSort: {
                        $cond: {
                            if: { $ne: ["$lead_score", null] },
                            then: "$lead_score",
                            else: -1
                        }
                    }
                }
            },
            { $sort: { scoreSort: -1, createdAt: -1 } },
            { $project: { scoreSort: 0 } }
        ])

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

/* EXPORT LEADS TO CSV */
const exportLeadsCsv = async (req, res) => {
    try {
        const leads = await Lead.aggregate([
            {
                $addFields: {
                    scoreSort: {
                        $cond: {
                            if: { $ne: ["$lead_score", null] },
                            then: "$lead_score",
                            else: -1
                        }
                    }
                }
            },
            { $sort: { scoreSort: -1, createdAt: -1 } },
            { $project: { scoreSort: 0 } }
        ])

        const headers = [
            "name",
            "email",
            "company",
            "role",
            "industry",
            "company_size",
            "growth_rate",
            "seniority",
            "lead_source",
            "linkedin",
            "status",
            "lead_score",
            "best_send_day",
            "best_send_hour",
            "insights",
            "createdAt",
            "updatedAt"
        ]

        const lines = [headers.join(",")]

        for (const lead of leads) {
            const row = headers.map((header) => {
                const rawValue = header === "insights"
                    ? Array.isArray(lead.insights) ? lead.insights.join(" | ") : ""
                    : lead[header]

                return csvEscape(rawValue)
            })

            lines.push(row.join(","))
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        res.setHeader("Content-Type", "text/csv; charset=utf-8")
        res.setHeader("Content-Disposition", `attachment; filename="leads-${timestamp}.csv"`)
        res.send(lines.join("\n"))
    } catch (err) {
        console.error("Export leads CSV failed:", err)
        res.status(500).json({ message: "Failed to export leads", error: err.message })
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

        // Score each lead via ML service before inserting
        const scoredLeads = await Promise.all(
            newLeads.map(async (lead) => {
                try {
                    const leadFeatures = {
                        role: lead.role || "",
                        industry: lead.industry || "",
                        company_size: lead.company_size || "",
                        lead_source: lead.lead_source || "",
                        seniority: lead.seniority || "",
                        growth_rate: lead.growth_rate || 0
                    }

                    const scoreRes = await fetch(`${ML_BASE_URL}/score-lead`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lead_features: leadFeatures })
                    })
                    const scoreData = await scoreRes.json()
                    lead.lead_score = scoreData.lead_score || null

                    const insightsRes = await fetch(`${ML_BASE_URL}/insights`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lead_features: leadFeatures, lead_score: lead.lead_score })
                    })
                    const insightsData = await insightsRes.json()
                    lead.insights = insightsData.insights || []

                    const timeRes = await fetch(`${ML_BASE_URL}/best-send-time`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            lead_features: {
                                ...leadFeatures,
                                lead_score: lead.lead_score
                            }
                        })
                    })
                    const timeData = await timeRes.json()
                    lead.best_send_day = timeData.best_send_day || null
                    lead.best_send_hour = timeData.best_send_hour != null ? timeData.best_send_hour : null
                } catch (mlErr) {
                    console.error(`ML scoring failed for lead ${lead.email}:`, mlErr.message)
                }
                return lead
            })
        )

        const insertedLeads = scoredLeads.length
            ? await Lead.insertMany(scoredLeads, { ordered: false })
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

        const normalizedEmail = normalizeOrFallbackEmail({ name, email, profileUrl })

        // Check for duplicate by LinkedIn URL or normalized email
        const query = []
        if (profileUrl) query.push({ linkedin: profileUrl })
        if (normalizedEmail) query.push({ email: normalizedEmail })

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
            email: normalizedEmail,
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

/* GET INSIGHTS FOR A LEAD */
const getLeadInsights = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" })
        }

        const leadFeatures = {
            role: lead.role || "",
            industry: lead.industry || "",
            company_size: lead.company_size || "",
            lead_source: lead.lead_source || "",
            seniority: lead.seniority || "",
            growth_rate: lead.growth_rate || 0
        }

        let lead_score = lead.lead_score
        if (lead_score == null) {
            try {
                const scoreRes = await fetch(`${ML_BASE_URL}/score-lead`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_features: leadFeatures })
                })
                const scoreData = await scoreRes.json()
                lead_score = scoreData.lead_score || 0
            } catch { lead_score = 0 }
        }

        let insights = []
        try {
            const insightsRes = await fetch(`${ML_BASE_URL}/insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_features: leadFeatures, lead_score })
            })
            const insightsData = await insightsRes.json()
            insights = insightsData.insights || []
        } catch (err) {
            console.error("Failed to get insights from ML:", err.message)
        }

        let best_send_day = lead.best_send_day || "Tuesday"
        let best_send_hour = lead.best_send_hour != null ? lead.best_send_hour : 10
        try {
            const timeRes = await fetch(`${ML_BASE_URL}/best-send-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_features: {
                        ...leadFeatures,
                        lead_score
                    }
                })
            })
            const timeData = await timeRes.json()
            best_send_day = timeData.best_send_day || best_send_day
            best_send_hour = timeData.best_send_hour != null ? timeData.best_send_hour : best_send_hour
        } catch { /* keep stored/default values */ }

        // Update lead with latest ML data
        lead.lead_score = lead_score
        lead.insights = insights
        lead.best_send_day = best_send_day
        lead.best_send_hour = best_send_hour
        await lead.save()

        res.json({
            lead_score,
            insights,
            best_send_day,
            best_send_hour
        })
    } catch (err) {
        console.error("Get lead insights failed:", err)
        res.status(500).json({ message: "Failed to get lead insights", error: err.message })
    }
}

/* GENERATE WORKFLOW TEMPLATE FOR A LEAD */
const generateLeadWorkflow = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" })
        }

        const leadFeatures = {
            role: lead.role || "",
            industry: lead.industry || "",
            company_size: lead.company_size || "",
            lead_source: lead.lead_source || "",
            seniority: lead.seniority || "",
            growth_rate: lead.growth_rate || 0
        }

        // Get score if not available
        let lead_score = lead.lead_score
        if (lead_score == null) {
            try {
                const scoreRes = await fetch(`${ML_BASE_URL}/score-lead`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_features: leadFeatures })
                })
                const scoreData = await scoreRes.json()
                lead_score = scoreData.lead_score || 0.5
            } catch { lead_score = 0.5 }
        }

        let best_send_day = lead.best_send_day || "Tuesday"
        let best_send_hour = lead.best_send_hour != null ? lead.best_send_hour : 10
        try {
            const timeRes = await fetch(`${ML_BASE_URL}/best-send-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_features: {
                        ...leadFeatures,
                        lead_score
                    }
                })
            })
            const timeData = await timeRes.json()
            best_send_day = timeData.best_send_day || best_send_day
            best_send_hour = timeData.best_send_hour != null ? timeData.best_send_hour : best_send_hour
            lead.best_send_day = best_send_day
            lead.best_send_hour = best_send_hour
            await lead.save()
        } catch (err) {
            console.error("Failed to refresh send time from ML:", err.message)
        }
        const insights = lead.insights || []

        // Call ML workflow strategy endpoint
        let workflowTemplate = null
        try {
            const wfRes = await fetch(`${ML_BASE_URL}/workflow-strategy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_features: leadFeatures,
                    lead_score,
                    best_send_day,
                    best_send_hour,
                    insights
                })
            })
            const wfData = await wfRes.json()
            workflowTemplate = wfData.workflow_template || null
        } catch (err) {
            console.error("Failed to get workflow template from ML:", err.message)
        }

        if (!workflowTemplate) {
            // Personalized fallback based on lead score
            const role = lead.role || "Professional"
            const industry = lead.industry || ""
            if (lead_score >= 0.7) {
                workflowTemplate = {
                    workflow_name: `High-Priority Outreach - ${role} (${industry})`,
                    steps: [
                        { step_number: 1, action: "send_email", email_type: "personalized_intro", send_day: best_send_day, send_hour: best_send_hour },
                        { step_number: 2, action: "wait", delay_days: 1 },
                        { step_number: 3, action: "send_email", email_type: "value_proposition", condition: "if_no_reply" },
                        { step_number: 4, action: "wait", delay_days: 2 },
                        { step_number: 5, action: "send_email", email_type: "meeting_request", condition: "if_no_reply" }
                    ]
                }
            } else if (lead_score >= 0.4) {
                workflowTemplate = {
                    workflow_name: `Nurture Sequence - ${role} (${industry})`,
                    steps: [
                        { step_number: 1, action: "send_email", email_type: "cold_email", send_day: best_send_day, send_hour: best_send_hour },
                        { step_number: 2, action: "wait", delay_days: 3 },
                        { step_number: 3, action: "send_email", email_type: "followup_1", condition: "if_no_reply" },
                        { step_number: 4, action: "wait", delay_days: 4 },
                        { step_number: 5, action: "send_email", email_type: "followup_2", condition: "if_no_reply" }
                    ]
                }
            } else {
                workflowTemplate = {
                    workflow_name: `Low-Touch Drip - ${role} (${industry})`,
                    steps: [
                        { step_number: 1, action: "send_email", email_type: "cold_email", send_day: best_send_day, send_hour: best_send_hour },
                        { step_number: 2, action: "wait", delay_days: 5 },
                        { step_number: 3, action: "send_email", email_type: "followup_1", condition: "if_no_reply" }
                    ]
                }
            }
        }

        // Convert ML template to workflow nodes/edges format
        const { nodes, edges } = convertTemplateToWorkflow(workflowTemplate, lead)

        // Save as a new workflow
        const workflow = await Workflow.create({
            name: workflowTemplate.workflow_name || `Workflow for ${lead.name || lead.email}`,
            description: `AI-generated workflow for ${lead.name || lead.email} (Score: ${(lead_score * 100).toFixed(1)}%)`,
            nodes,
            edges,
            created_by: req.user?.userId || undefined
        })

        res.json({
            workflow_template: workflowTemplate,
            workflow
        })
    } catch (err) {
        console.error("Generate lead workflow failed:", err)
        res.status(500).json({ message: "Failed to generate workflow", error: err.message })
    }
}

/* Convert ML workflow template steps into ReactFlow nodes/edges */
function convertTemplateToWorkflow(template, lead) {
    const nodes = []
    const edges = []
    const steps = template.steps || []

    // Add a start/trigger node
    const triggerId = "trigger-1"
    nodes.push({
        id: triggerId,
        type: "trigger",
        position: { x: 300, y: 50 },
        data: {
            label: "Lead Enrolled",
            subtitle: lead.name || lead.email,
            category: "trigger",
            config: {}
        }
    })

    let prevNodeId = triggerId

    steps.forEach((step, idx) => {
        const nodeId = `step-${step.step_number || idx + 1}`
        const yPos = 150 + idx * 150

        let nodeType = "action"
        let label = ""
        let subtitle = ""
        const config = {}

        if (step.action === "send_email") {
            nodeType = "action"
            const emailType = (step.email_type || "email").replace(/_/g, " ")
            label = emailType.charAt(0).toUpperCase() + emailType.slice(1)
            subtitle = step.send_day && step.send_hour != null
                ? `${step.send_day} at ${step.send_hour}:00`
                : ""
            config.channel = "email"
            config.emailType = step.email_type
            if (step.send_day) config.sendDay = step.send_day
            if (step.send_hour != null) config.sendHour = step.send_hour
        } else if (step.action === "wait") {
            nodeType = "wait"
            label = `Wait ${step.delay_days || 1} day${(step.delay_days || 1) > 1 ? 's' : ''}`
            subtitle = ""
            config.delayHours = (step.delay_days || 1) * 24
        } else if (step.action === "check_condition" || step.condition) {
            nodeType = "condition"
            label = (step.condition || step.action || "Check").replace(/_/g, " ")
            subtitle = ""
        } else {
            label = (step.action || "Action").replace(/_/g, " ")
        }

        nodes.push({
            id: nodeId,
            type: nodeType,
            position: { x: 300, y: yPos },
            data: {
                label,
                subtitle,
                category: nodeType === "wait" ? "logic" : nodeType === "condition" ? "logic" : "action",
                config
            }
        })

        edges.push({
            id: `edge-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            type: "smoothstep",
            animated: true
        })

        prevNodeId = nodeId
    })

    return { nodes, edges }
}

/* SYNC LEADS (batch import from Chrome Extension) */
const syncLeads = async (req, res) => {
    try {
        const { leads } = req.body

        if (!Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ message: "No leads provided" })
        }

        let synced = 0
        let duplicates = 0
        let skippedInvalid = 0
        const insertedLeads = []

        for (const item of leads) {
            const name = (item.name || "").trim()
            const profileUrl = (item.profileUrl || item.linkedin || "").trim()

            if (!name && !profileUrl && !item.email) {
                skippedInvalid += 1
                continue
            }

            const normalizedEmail = normalizeOrFallbackEmail({
                name,
                email: item.email,
                profileUrl
            })

            // Check for duplicate by LinkedIn URL or normalized email
            const query = []
            if (profileUrl) query.push({ linkedin: profileUrl })
            if (normalizedEmail) query.push({ email: normalizedEmail })

            if (query.length > 0) {
                const existing = await Lead.findOne({ $or: query })
                if (existing) {
                    duplicates++
                    continue
                }
            }

            const lead = await Lead.create({
                name,
                email: normalizedEmail,
                company: item.company || "",
                role: item.role || "",
                linkedin: profileUrl,
                lead_source: "extension",
                status: "new"
            })

            insertedLeads.push(lead)
            synced++
        }

        res.json({
            message: `Synced ${synced} lead(s)`,
            syncedCount: synced,
            duplicates,
            skippedInvalid,
            leads: insertedLeads
        })
    } catch (err) {
        console.error("Sync leads failed:", err)
        res.status(500).json({ message: "Failed to sync leads", error: err.message })
    }
}

module.exports = {
    uploadLeads,
    getLeads,
    exportLeadsCsv,
    getLeadById,
    deleteLead,
    enrollLead,
    syncLeads,
    getLeadInsights,
    generateLeadWorkflow
}
