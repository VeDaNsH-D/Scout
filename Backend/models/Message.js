const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  channel: { type: String, enum: ['email'], default: 'email' },
  subject: String,
  content: String,
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);