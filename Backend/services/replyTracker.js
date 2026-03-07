const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Message = require('../schemas/message_schema');
const Lead = require('../schemas/lead_schema');
const WorkflowRun = require('../schemas/workflow_run_schema');
const Workflow = require('../schemas/workflow_schema');
const emailService = require('./emailService');
const { generateReplyEmail } = require('./llmService');

/**
 * ReplyTracker Service
 * Uses IMAP to poll the inbox for replies to our outreach emails,
 * records incoming messages, updates lead status, and sends AI-generated follow-ups.
 */
class ReplyTracker {
    constructor() {
        this.imapConfig = {
            user: process.env.SMTP_USER,
            password: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
            host: process.env.IMAP_HOST || 'imap.gmail.com',
            port: Number(process.env.IMAP_PORT || 993),
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
        };
    }

    /** Open an IMAP connection */
    _connect() {
        return new Promise((resolve, reject) => {
            const imap = new Imap(this.imapConfig);
            imap.once('ready', () => resolve(imap));
            imap.once('error', (err) => reject(err));
            imap.connect();
        });
    }

    /**
     * Main entry point – checks inbox for replies and processes them.
     */
    async processReplies() {
        if (!this.imapConfig.user || !this.imapConfig.password) {
            console.log('[ReplyTracker] SMTP credentials not configured, skipping reply check');
            return;
        }

        console.log('[ReplyTracker] 📬 Checking for email replies…');

        // Fetch all outgoing messageIds we need to track
        const sentMessages = await Message.find({
            direction: 'outgoing',
            status: 'sent',
            messageId: { $exists: true, $ne: null },
        }).lean();

        if (sentMessages.length === 0) {
            console.log('[ReplyTracker] No sent messages to track replies for');
            return;
        }

        const sentMessageMap = new Map();
        for (const msg of sentMessages) {
            sentMessageMap.set(msg.messageId, msg);
        }

        let imap;
        try {
            imap = await this._connect();
            const replies = await this._searchReplies(imap, sentMessageMap);
            imap.end();

            if (replies.length === 0) {
                console.log('[ReplyTracker] No new replies found');
                return;
            }

            console.log(`[ReplyTracker] 📩 Found ${replies.length} new replies`);

            for (const { originalMessage, reply } of replies) {
                await this._handleReply(originalMessage, reply);
            }
        } catch (error) {
            console.error('[ReplyTracker] Error checking replies:', error.message);
            if (imap) {
                try { imap.end(); } catch (_) { /* ignore */ }
            }
        }
    }

    /**
     * Search INBOX for unseen emails that are replies to our sent messages.
     */
    _searchReplies(imap, sentMessageMap) {
        return new Promise((resolve, reject) => {
            imap.openBox('INBOX', false, (err) => {
                if (err) return reject(err);

                const since = new Date();
                since.setDate(since.getDate() - 7);

                imap.search(['UNSEEN', ['SINCE', since]], (searchErr, uids) => {
                    if (searchErr) return reject(searchErr);
                    if (!uids || uids.length === 0) return resolve([]);

                    const results = [];
                    let pending = 0;
                    let fetchDone = false;

                    const tryResolve = () => {
                        if (fetchDone && pending === 0) resolve(results);
                    };

                    const fetch = imap.fetch(uids, { bodies: '', markSeen: false });

                    fetch.on('message', (msg) => {
                        let buffer = '';
                        pending++;

                        msg.on('body', (stream) => {
                            stream.on('data', (chunk) => { buffer += chunk.toString('utf8'); });
                        });

                        msg.on('end', () => {
                            simpleParser(buffer)
                                .then((parsed) => {
                                    const inReplyTo = parsed.inReplyTo;
                                    const references = Array.isArray(parsed.references)
                                        ? parsed.references
                                        : typeof parsed.references === 'string'
                                            ? [parsed.references]
                                            : [];

                                    let matchedMsg = null;
                                    if (inReplyTo && sentMessageMap.has(inReplyTo)) {
                                        matchedMsg = sentMessageMap.get(inReplyTo);
                                    }
                                    if (!matchedMsg) {
                                        for (const ref of references) {
                                            if (sentMessageMap.has(ref)) {
                                                matchedMsg = sentMessageMap.get(ref);
                                                break;
                                            }
                                        }
                                    }

                                    if (matchedMsg) {
                                        results.push({
                                            originalMessage: matchedMsg,
                                            reply: {
                                                from: parsed.from?.text,
                                                subject: parsed.subject,
                                                text: parsed.text,
                                                html: parsed.html,
                                                date: parsed.date,
                                                messageId: parsed.messageId,
                                                inReplyTo,
                                            },
                                        });
                                    }
                                })
                                .catch((parseErr) => {
                                    console.error('[ReplyTracker] Error parsing email:', parseErr.message);
                                })
                                .finally(() => {
                                    pending--;
                                    tryResolve();
                                });
                        });
                    });

                    fetch.once('error', reject);
                    fetch.once('end', () => {
                        fetchDone = true;
                        tryResolve();
                    });
                });
            });
        });
    }

    /**
     * Process a single matched reply: save message, update lead, send auto-reply.
     */
    async _handleReply(originalMessage, reply) {
        try {
            // Deduplicate – skip if we already recorded this incoming message
            if (reply.messageId) {
                const existing = await Message.findOne({
                    direction: 'incoming',
                    messageId: reply.messageId,
                });
                if (existing) return;
            }

            // Save incoming message
            await Message.create({
                lead_id: originalMessage.lead_id,
                workflow_run_id: originalMessage.workflow_run_id,
                channel: 'email',
                direction: 'incoming',
                content: reply.text || reply.html || '',
                status: 'received',
                messageId: reply.messageId || null,
                inReplyTo: reply.inReplyTo || null,
                sent_at: reply.date || new Date(),
            });

            // Update lead status
            const lead = await Lead.findById(originalMessage.lead_id);
            if (lead && lead.status !== 'converted') {
                lead.status = 'replied';
                lead.last_replied_at = new Date();
                await lead.save();
                console.log(`[ReplyTracker] ✅ Lead ${lead.email} marked as replied`);
            }

            // Send AI-generated follow-up reply
            await this._sendAutoReply(originalMessage, reply, lead);
        } catch (error) {
            console.error('[ReplyTracker] Error handling reply:', error.message);
        }
    }

    /**
     * Generate and send an AI-powered reply to the lead's response.
     */
    async _sendAutoReply(originalMessage, reply, lead) {
        if (!lead || !lead.email) return;

        try {
            const workflowRun = await WorkflowRun.findById(originalMessage.workflow_run_id);
            const workflow = workflowRun
                ? await Workflow.findById(workflowRun.workflow_id)
                : null;

            const campaignContext = {
                team_name: workflow?.name || 'Our Team',
                product_name: 'Our Product',
                product_description: 'A platform to help your business grow',
                pain_point: 'improving efficiency and outcomes',
                goal: 'continuing the conversation',
            };

            // If there's node-level config stashed on the workflow run, override defaults
            if (workflow) {
                const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
                for (const n of nodes) {
                    const cfg = n.data?.config;
                    if (cfg) {
                        if (cfg.product_name) campaignContext.product_name = cfg.product_name;
                        if (cfg.product_description) campaignContext.product_description = cfg.product_description;
                        if (cfg.pain_point) campaignContext.pain_point = cfg.pain_point;
                        break;
                    }
                }
            }

            const generated = await generateReplyEmail(lead, reply.text || '', campaignContext);

            const reSubject = reply.subject?.startsWith('Re:')
                ? reply.subject
                : `Re: ${reply.subject || 'Our conversation'}`;

            const result = await emailService.sendEmail(
                lead.email,
                reSubject,
                generated.body,
                reply.messageId // thread the reply
            );

            await Message.create({
                lead_id: lead._id,
                workflow_run_id: originalMessage.workflow_run_id,
                channel: 'email',
                direction: 'outgoing',
                content: generated.body,
                sent_at: new Date(),
                status: result.success ? 'sent' : 'failed',
                messageId: result.messageId || null,
                inReplyTo: reply.messageId || null,
            });

            console.log(`[ReplyTracker] 📧 Auto-reply sent to ${lead.email}`);
        } catch (error) {
            console.error(`[ReplyTracker] Error sending auto-reply to ${lead?.email}:`, error.message);
        }
    }
}

module.exports = new ReplyTracker();
