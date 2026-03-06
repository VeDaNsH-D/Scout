const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const Message = require('../schemas/message_schema');

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
    if (leadId) {
      await Message.create({
        lead_id: leadId,
        channel: 'email',
        content: message,
        sent_at: new Date()
      });
    }

    res.status(200).json({
      message: 'Email sent successfully',
      result
    });
  } catch (error) {
    console.error(`[Routes] ❌ Error sending email:`, error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;