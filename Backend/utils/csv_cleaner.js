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

        if (!email) continue

        const cleanEmail = email.trim().toLowerCase()

        if (seenEmails.has(cleanEmail)) continue

        seenEmails.add(cleanEmail)

        cleaned.push({
            name: name.trim(),
            email: cleanEmail,
            company: company.trim(),
            role: role.trim()
        })
    }

    return cleaned
}

module.exports = cleanLeads