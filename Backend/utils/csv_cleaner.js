function cleanLeads(rows) {

    const cleaned = []
    const seenEmails = new Set()

    for (let row of rows) {

        const normalized = {}

        // Normalize headers
        for (const key in row) {
            const normalizedKey = key.toLowerCase().replace(/\s+/g, "_")
            normalized[normalizedKey] = row[key]
        }

        const name =
            normalized.name ||
            normalized.full_name ||
            normalized.contact_name ||
            ""

        const email =
            normalized.email ||
            normalized.email_address ||
            ""

        const company =
            normalized.company ||
            normalized.company_name ||
            normalized.organization ||
            ""

        const role =
            normalized.role ||
            normalized.title ||
            normalized.job_title ||
            ""

        const industry = normalized.industry || ""
        const company_size = normalized.company_size || ""

        let growth_rate = undefined
        if (normalized.growth_rate) {
            const parsedGrowthRate = parseFloat(normalized.growth_rate)
            if (!isNaN(parsedGrowthRate)) {
                growth_rate = parsedGrowthRate
            }
        }

        const seniority = normalized.seniority || ""
        const lead_source = normalized.lead_source || ""

        if (!email) continue

        const cleanEmail = email.trim().toLowerCase()

        if (seenEmails.has(cleanEmail)) continue

        seenEmails.add(cleanEmail)

        cleaned.push({
            name: name.trim(),
            email: cleanEmail,
            company: company.trim(),
            role: role.trim(),
            industry: industry.trim(),
            company_size: company_size.trim(),
            growth_rate,
            seniority: seniority.trim(),
            lead_source: lead_source.trim()
        })
    }

    return cleaned
}

module.exports = cleanLeads