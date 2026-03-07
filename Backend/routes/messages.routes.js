const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const Message = require('../schemas/message_schema');
const Lead = require('../schemas/lead_schema');

const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

/**
 * @route POST /api/messages/send-email
 * @desc Sends an email directly to a lead
 * @access Public/Private
 */
router.post('/send-email', async (req, res) => {
  try {
    const { leadId, email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: email, subject, message' });
    }

    // Mock send email
    const result = await emailService.sendEmail(email, subject, message);

    // Save message record
    let leadStatusUpdate = null;
    if (leadId) {
      let lead = null;
      if (result.success) {
        lead = await Lead.findById(leadId);
      }

      if (lead && lead.status === 'new') {
        lead.status = 'contacted';
        await lead.save();
        leadStatusUpdate = {
          previousStatus: 'new',
          newStatus: 'contacted',
        };
      }

      await Message.create({
        lead_id: leadId,
        channel: 'email',
        direction: 'outgoing',
        content: message,
        sent_at: new Date(),
        status: result.success ? 'sent' : 'failed'
      });
    }

    res.status(200).json({
      message: result.success ? 'Email sent successfully' : 'Email failed to send',
      result,
      leadStatusUpdate,
    });
  } catch (error) {
    console.error(`[Routes] ❌ Error sending email:`, error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @route POST /api/messages/reply
 * @desc Records a lead reply, updates lead status/score, and optionally sends acknowledgment.
 * @access Public/Private
 */
router.post('/reply', async (req, res) => {
  try {
    const {
      leadId,
      email,
      message,
      sendAcknowledgement = true,
      acknowledgementSubject,
      acknowledgementMessage,
    } = req.body;

    if ((!leadId && !email) || !message) {
      return res.status(400).json({
        error: 'Missing required fields: (leadId or email), message',
      });
    }

    const query = leadId ? { _id: leadId } : { email: String(email).trim().toLowerCase() };
    const lead = await Lead.findOne(query);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const previousStatus = lead.status;
    const previousScore = clampScore(
      lead.lead_score == null ? 0 : Number(lead.lead_score),
    );

    const shouldTransitionToReplied = previousStatus === 'new' || previousStatus === 'contacted';
    const scoreBoostApplied = shouldTransitionToReplied;

    if (shouldTransitionToReplied) {
      lead.status = 'replied';
      lead.lead_score = clampScore(previousScore + 0.1);
      await lead.save();
    }

    await Message.create({
      lead_id: lead._id,
      channel: 'email',
      direction: 'incoming',
      content: message,
      sent_at: new Date(),
      status: 'received',
    });

    let acknowledgement = {
      attempted: false,
      sent: false,
      error: null,
    };

    if (sendAcknowledgement && shouldTransitionToReplied && lead.email) {
      const firstName = lead.name ? String(lead.name).split(' ')[0] : 'there';
      const subject = acknowledgementSubject || 'Thanks for your reply';
      const body = acknowledgementMessage ||
        `Hi ${firstName},\n\nThanks for your reply. We have updated your status and our team will get back to you shortly.\n\nBest regards,\nOutreach Team`;

      acknowledgement.attempted = true;
      const acknowledgementResult = await emailService.sendEmail(lead.email, subject, body);
      acknowledgement.sent = Boolean(acknowledgementResult.success);
      acknowledgement.error = acknowledgementResult.error || null;

      await Message.create({
        lead_id: lead._id,
        channel: 'email',
        direction: 'outgoing',
        content: body,
        sent_at: new Date(),
        status: acknowledgementResult.success ? 'sent' : 'failed',
      });
    }

    const updatedScore = clampScore(
      lead.lead_score == null ? 0 : Number(lead.lead_score),
    );
    const userNotification = scoreBoostApplied
      ? `Lead ${lead.email} moved to "${lead.status}" and score updated to ${Math.round(updatedScore * 100)}%.`
      : `Reply recorded for ${lead.email}. Current status is "${lead.status}" with score ${Math.round(updatedScore * 100)}%.`;

    return res.status(200).json({
      message: 'Reply feedback captured',
      userNotification,
      lead: {
        id: lead._id,
        email: lead.email,
        status: lead.status,
        lead_score: updatedScore,
      },
      changes: {
        previousStatus,
        newStatus: lead.status,
        previousScore,
        newScore: updatedScore,
        statusChanged: shouldTransitionToReplied,
        scoreBoostApplied,
      },
      acknowledgement,
    });
  } catch (error) {
    console.error('[Routes] Error recording reply feedback:', error.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
