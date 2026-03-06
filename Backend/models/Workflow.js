const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: String,
  nodes: [mongoose.Schema.Types.Mixed],
  edges: [mongoose.Schema.Types.Mixed],
  createdBy: String
});

module.exports = mongoose.model('Workflow', workflowSchema);