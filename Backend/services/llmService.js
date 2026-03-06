const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const EMAIL_TYPES = ["cold_email", "followup_1", "followup_2", "final_followup"];

async function generateResponse(prompt) {

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    return completion.choices[0].message.content;
}

/**
 * Build a prompt for personalized email generation (mirrors emailGen.py logic)
 */
function buildEmailPrompt(lead, insights, campaignContext, emailType) {
    let emailInstruction = "";

    switch (emailType) {
        case "cold_email":
            emailInstruction = "Write the first cold outreach email.";
            break;
        case "followup_1":
            emailInstruction = "Write a polite follow-up email if the lead has not replied.";
            break;
        case "followup_2":
            emailInstruction = "Write a short second follow-up email reminding the lead.";
            break;
        case "final_followup":
            emailInstruction = "Write a final short follow-up email before closing the outreach.";
            break;
        default:
            emailInstruction = "Write a professional outreach email.";
    }

    return `You are an expert B2B sales outreach assistant.

${emailInstruction}

-------------------------
LEAD DETAILS
-------------------------
Role: ${lead.role || "Unknown"}
Industry: ${lead.industry || "Unknown"}
Company Size: ${lead.company_size || "Unknown"}
Lead Source: ${lead.lead_source || "Unknown"}
Company Name: ${lead.company || "Unknown"}
Lead Score: ${lead.lead_score || "Unknown"}

-------------------------
AI INSIGHTS
-------------------------
${(insights || []).join("\n")}

-------------------------
OUR TEAM
-------------------------
Team Name: ${campaignContext.team_name || "Unknown"}
Product Name: ${campaignContext.product_name || "Unknown"}
Product Description: ${campaignContext.product_description || "Unknown"}

-------------------------
CAMPAIGN CONTEXT
-------------------------
Pain Point: ${campaignContext.pain_point || "Unknown"}
Goal: ${campaignContext.goal || "Unknown"}

-------------------------
CONSTRAINTS
-------------------------
- Maximum 80 words
- Friendly and conversational tone
- Personalized to the lead
- Avoid spammy language
- End with a call-to-action
- Return ONLY the email body text, no subject line, no labels
`;
}

/**
 * Generate a fallback email when LLM is unavailable
 */
function fallbackEmail(lead, campaignContext, emailType) {
    const name = lead.company || "your team";
    const role = lead.role || "team";
    const product = campaignContext.product_name || "our platform";
    const pain = (campaignContext.pain_point || "improving pipeline visibility").toLowerCase();
    const goal = (campaignContext.goal || "a short intro call").toLowerCase();

    const templates = {
        cold_email:
            `Hi, noticed ${name} is growing and thought this might help your ${role} team. ` +
            `${product} helps with ${pain}. ` +
            `Would you be open to a quick chat this week to see if it fits your goals?`,
        followup_1:
            `Hi, following up in case my last note got buried. ` +
            `We help teams like ${name} improve outcomes around ${pain}. ` +
            `Open to a brief 15-minute conversation?`,
        followup_2:
            `Quick follow-up: if ${pain} is a priority this quarter, ` +
            `${product} might be useful for your team at ${name}. ` +
            `Would a short call be worth it?`,
        final_followup:
            `Final note from me. If now is not the right time, no worries. ` +
            `If helpful, I can share a short overview of how ${product} supports teams like ${name}. ` +
            `Interested in ${goal}?`,
    };

    return templates[emailType] || `Hi, I'd love to connect about how ${product} can help ${name}. Would you be open to a quick chat?`;
}

/**
 * Generate a personalized email using Llama3 via Groq
 * @param {Object} lead - Lead document (name, email, company, role, industry, etc.)
 * @param {string[]} insights - AI-generated insights for the lead
 * @param {Object} campaignContext - { team_name, product_name, product_description, pain_point, goal }
 * @param {string} emailType - One of: cold_email, followup_1, followup_2, final_followup
 * @returns {{ subject: string, body: string }}
 */
async function generateEmail(lead, insights, campaignContext, emailType) {
    const prompt = buildEmailPrompt(lead, insights, campaignContext, emailType);

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a B2B sales email writer. Return ONLY the email body text. No subject line, no labels, no markdown formatting."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        const body = (completion.choices[0].message.content || "").trim();
        if (!body) {
            console.warn("[LLMService] Llama3 returned empty response, using fallback");
            return {
                subject: generateSubject(lead, campaignContext, emailType),
                body: fallbackEmail(lead, campaignContext, emailType),
            };
        }

        return {
            subject: generateSubject(lead, campaignContext, emailType),
            body,
        };
    } catch (error) {
        console.error("[LLMService] Email generation failed:", error.message);
        return {
            subject: generateSubject(lead, campaignContext, emailType),
            body: fallbackEmail(lead, campaignContext, emailType),
        };
    }
}

/**
 * Generate a contextual subject line
 */
function generateSubject(lead, campaignContext, emailType) {
    const product = campaignContext.product_name || "our solution";
    const company = lead.company || "";

    switch (emailType) {
        case "cold_email":
            return company ? `Quick question for ${company}` : `Quick question about ${product}`;
        case "followup_1":
            return `Following up — ${product}`;
        case "followup_2":
            return company ? `Still interested, ${company}?` : `Checking in — ${product}`;
        case "final_followup":
            return `Last note from us`;
        default:
            return `${product} — Let's connect`;
    }
}

module.exports = { generateResponse, generateEmail, buildEmailPrompt, fallbackEmail, EMAIL_TYPES };