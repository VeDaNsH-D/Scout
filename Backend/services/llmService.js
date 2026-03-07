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
    const leadName = lead.name ? lead.name.split(' ')[0] : '';
    let emailInstruction = "";
    let toneGuidance = "";

    switch (emailType) {
        case "cold_email":
            emailInstruction = "Write the first cold outreach email. This is the very first time we are reaching out — make a strong, personalized first impression.";
            toneGuidance = "Be warm and curious. Reference something specific about their role or industry to show you did your homework. Lead with a relevant pain point, not a product pitch.";
            break;
        case "followup_1":
            emailInstruction = "Write a polite first follow-up email. The lead has not replied to the initial outreach.";
            toneGuidance = "Be understanding and low-pressure. Add new value (e.g. a relevant insight or stat) rather than just repeating the first email. Keep it shorter than the initial email.";
            break;
        case "followup_2":
            emailInstruction = "Write a brief second follow-up email. The lead has not replied to two previous emails.";
            toneGuidance = "Be concise and direct. Offer a specific, easy next step (e.g. 'Would a 10-minute call on Thursday work?'). Show respect for their time.";
            break;
        case "final_followup":
            emailInstruction = "Write a final follow-up email before closing the outreach loop.";
            toneGuidance = "Be graceful and confident. Make it clear this is the last email. Leave the door open without being pushy. A brief 2-3 sentence email works best.";
            break;
        default:
            emailInstruction = "Write a professional outreach email.";
            toneGuidance = "Be professional and personalized.";
    }

    const insightBlock = (insights || []).length > 0
        ? `\nAI INSIGHTS ABOUT THIS LEAD (use these to personalize):\n${insights.join("\n")}\n`
        : '';

    return `${emailInstruction}

-------------------------
ABOUT THE RECIPIENT
-------------------------
Name: ${leadName || "(not available — do NOT use a placeholder name)"}
Role/Title: ${lead.role || "Unknown"}
Seniority: ${lead.seniority || "Unknown"}
Company: ${lead.company || "Unknown"}
Industry: ${lead.industry || "Unknown"}
Company Size: ${lead.company_size || "Unknown"}
Lead Source: ${lead.lead_source || "Unknown"}
Lead Score: ${lead.lead_score || "Unknown"}
${insightBlock}
-------------------------
WHAT WE OFFER
-------------------------
Team/Sender: ${campaignContext.team_name || "Our Team"}
Product: ${campaignContext.product_name || "Our Product"}
What it does: ${campaignContext.product_description || "A platform to help businesses grow"}
Pain point we solve: ${campaignContext.pain_point || "improving efficiency"}
Desired outcome: ${campaignContext.goal || "a short introductory call"}

-------------------------
TONE & STYLE
-------------------------
${toneGuidance}

-------------------------
RULES (MUST FOLLOW)
-------------------------
- ${leadName ? `Address the recipient as "${leadName}"` : "Do NOT use any name greeting — start with a contextual hook instead"}
- 100-150 words maximum
- Write like a real human, not a bot — vary sentence length, be natural
- NO generic openers like "I hope this email finds you well" or "I wanted to reach out"
- Reference their specific industry (${lead.industry || 'their field'}) or role (${lead.role || 'their position'}) naturally
- One clear call-to-action at the end
- Sign off with just a first name (use "Best" or "Cheers" — no "Regards" or "Sincerely")
- Return ONLY the email body text — no subject line, no labels, no markdown formatting
`;
}

/**
 * Generate a fallback email when LLM is unavailable
 */
function fallbackEmail(lead, campaignContext, emailType) {
    const firstName = lead.name ? lead.name.split(' ')[0] : '';
    const company = lead.company || "your team";
    const role = lead.role || "team";
    const product = campaignContext.product_name || "our platform";
    const pain = (campaignContext.pain_point || "improving pipeline visibility").toLowerCase();
    const goal = (campaignContext.goal || "a short intro call").toLowerCase();
    const greeting = firstName ? `Hi ${firstName},` : `Hi there,`;

    const templates = {
        cold_email:
            `${greeting}\n\n` +
            `I came across ${company} and noticed your ${role} team might be navigating challenges around ${pain}. ` +
            `We built ${product} specifically to help with that — and teams in your space have seen real results.\n\n` +
            `Would you be open to a quick 15-minute chat this week to see if it's a fit?\n\n` +
            `Cheers`,
        followup_1:
            `${greeting}\n\n` +
            `Just circling back on my earlier note. I know things get busy, so I'll keep this short — ` +
            `${product} has been helping teams like ${company} tackle ${pain}, and I think there could be a fit.\n\n` +
            `Worth a brief conversation?\n\n` +
            `Best`,
        followup_2:
            `${greeting}\n\n` +
            `If ${pain} is still on your radar this quarter, I'd love to show you how ${product} could help your team at ${company}. ` +
            `Happy to keep it to 10 minutes.\n\n` +
            `Cheers`,
        final_followup:
            `${greeting}\n\n` +
            `This will be my last note — I don't want to clutter your inbox. ` +
            `If ${product} ever becomes relevant for ${company}, I'd be happy to chat. No pressure at all.\n\n` +
            `Wishing you and the team all the best.\n\n` +
            `Best`,
    };

    return templates[emailType] || `${greeting}\n\nI'd love to connect about how ${product} can help ${company}. Would you be open to a quick chat?\n\nCheers`;
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
                    content: `You are a top-performing B2B sales development rep who writes highly personalized, concise outreach emails. Your emails consistently get replies because they:
- Feel like they were written by a real person who researched the recipient
- Lead with relevance to the recipient's world, not a product pitch
- Are short, scannable, and respect the reader's time
- Have a natural, conversational tone — not corporate or salesy

Return ONLY the email body text. No subject line, no "Subject:" label, no markdown, no asterisks, no bullet points.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.6,
            max_tokens: 400,
        });

        const body = (completion.choices[0].message.content || "").trim();
        if (!body) {
            console.warn("[LLMService] Llama3 returned empty response, using fallback");
            return {
                subject: await generateSubject(lead, campaignContext, emailType),
                body: fallbackEmail(lead, campaignContext, emailType),
            };
        }

        // Clean up any stray markdown or labels the model might have added
        const cleanBody = body
            .replace(/^(Subject|Re|Email|Body)\s*[:：].*\n?/gim, '')
            .replace(/\*\*/g, '')
            .replace(/^#+\s*/gm, '')
            .trim();

        return {
            subject: await generateSubject(lead, campaignContext, emailType),
            body: cleanBody,
        };
    } catch (error) {
        console.error("[LLMService] Email generation failed:", error.message);
        const fallbackSubject = `${campaignContext.product_name || 'Our solution'} for ${lead.company || 'your team'}`;
        return {
            subject: fallbackSubject,
            body: fallbackEmail(lead, campaignContext, emailType),
        };
    }
}

/**
 * Generate a contextual subject line
 */
async function generateSubject(lead, campaignContext, emailType) {
    const product = campaignContext.product_name || "our solution";
    const company = lead.company || "";
    const role = lead.role || "";
    const industry = lead.industry || "";

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Generate a single short email subject line (max 8 words). No quotes, no labels, no explanation. Just the subject line text."
                },
                {
                    role: "user",
                    content: `Write a subject line for a ${emailType.replace('_', ' ')} email.
Recipient: ${role} at ${company} in ${industry}.
Product: ${product}.
Make it specific, curiosity-driving, and NOT spammy. No generic phrases like "Quick question" or "Touching base".`
                }
            ],
            temperature: 0.7,
            max_tokens: 30,
        });

        const subject = (completion.choices[0].message.content || "").trim().replace(/^["']|["']$/g, '');
        if (subject && subject.length > 3 && subject.length < 80) {
            return subject;
        }
    } catch (err) {
        console.warn("[LLMService] Subject generation failed, using fallback:", err.message);
    }

    // Fallback subjects
    switch (emailType) {
        case "cold_email":
            return company ? `${role ? role + 's' : 'Teams'} at ${company} + ${product}` : `Idea for your ${role || 'team'}`;
        case "followup_1":
            return `Re: ${product} for ${company || 'your team'}`;
        case "followup_2":
            return company ? `Worth 10 min, ${company}?` : `Quick thought on ${product}`;
        case "final_followup":
            return `Closing the loop`;
        default:
            return `${product} for ${company || 'your team'}`;
    }
}

/**
 * Generate a contextual reply email based on the lead's response
 * @param {Object} lead - Lead document
 * @param {string} replyText - The text of the lead's reply
 * @param {Object} campaignContext - Campaign context info
 * @returns {{ body: string }}
 */
async function generateReplyEmail(lead, replyText, campaignContext) {
    const firstName = lead.name ? lead.name.split(' ')[0] : '';
    const greeting = firstName ? `Hi ${firstName},` : `Hi there,`;

    const prompt = `You are responding to a reply from a B2B lead. The lead replied to our outreach email. Write a thoughtful, personalized follow-up that continues the conversation naturally.

-------------------------
ABOUT THE LEAD
-------------------------
Name: ${firstName || "(not available)"}
Role: ${lead.role || "Unknown"}
Company: ${lead.company || "Unknown"}
Industry: ${lead.industry || "Unknown"}

-------------------------
WHAT WE OFFER
-------------------------
Team/Sender: ${campaignContext.team_name || "Our Team"}
Product: ${campaignContext.product_name || "Our Product"}
What it does: ${campaignContext.product_description || "A platform to help businesses grow"}
Goal: ${campaignContext.goal || "continuing the conversation"}

-------------------------
THE LEAD'S REPLY
-------------------------
${replyText}

-------------------------
RULES
-------------------------
- ${firstName ? `Address them as "${firstName}"` : "Do NOT use any name — start directly"}
- Directly acknowledge what they said in their reply
- If they asked a question, answer it helpfully
- If they showed interest, propose a concrete next step (e.g., a call time)
- If they seem hesitant, be understanding and offer more info without being pushy
- 80-150 words maximum
- Write like a real human, conversational tone
- One clear call-to-action
- Sign off with just a first name (use "Best" or "Cheers")
- Return ONLY the email body text — no subject line, no labels, no markdown`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are a skilled B2B sales rep who writes natural, helpful reply emails. You read the lead's response carefully and craft a reply that moves the conversation forward. Your replies feel personal and human, never scripted or generic.

Return ONLY the email body text. No subject line, no labels, no markdown.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.6,
            max_tokens: 400,
        });

        const body = (completion.choices[0].message.content || "").trim();
        if (!body) {
            return {
                body: `${greeting}\n\nThank you for getting back to us! I'd love to continue our conversation and answer any questions you might have about ${campaignContext.product_name || 'our solution'}.\n\nWould you be open to a quick call this week?\n\nCheers`
            };
        }

        const cleanBody = body
            .replace(/^(Subject|Re|Email|Body)\s*[:：].*\n?/gim, '')
            .replace(/\*\*/g, '')
            .replace(/^#+\s*/gm, '')
            .trim();

        return { body: cleanBody };
    } catch (error) {
        console.error("[LLMService] Reply email generation failed:", error.message);
        return {
            body: `${greeting}\n\nThank you for getting back to us! I'd love to continue our conversation and answer any questions you might have about ${campaignContext.product_name || 'our solution'}.\n\nWould you be open to a quick call this week?\n\nCheers`
        };
    }
}

module.exports = { generateResponse, generateEmail, generateReplyEmail, buildEmailPrompt, fallbackEmail, EMAIL_TYPES };