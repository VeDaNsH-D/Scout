const mongoose = require('mongoose');

const workflowRunSchema = new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  currentStep: String,
  status: { type: String, enum: ['running', 'completed', 'failed', 'paused'], default: 'running' }
}, { timestamps: true });

module.exports = mongoose.model('WorkflowRun', workflowRunSchema);