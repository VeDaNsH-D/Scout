const express = require('express');
const router = express.Router();
const workflowEngine = require('../services/workflowEngine');
const WorkflowRun = require('../models/WorkflowRun');

/**
 * @route POST /api/workflows/:workflowId/start
 * @desc Starts automation for selected leads
 * @access Public/Private
 */
router.post('/workflows/:workflowId/start', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'leadIds array is required' });
    }

    const runs = await workflowEngine.startWorkflow(workflowId, leadIds);

    res.status(200).json({
      message: 'Workflow started successfully',
      runs: runs.map(run => ({
        id: run._id,
        leadId: run.leadId,
        status: run.status
      }))
    });
  } catch (error) {
    console.error(`[Routes] Error starting workflow:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/workflow-runs/:runId
 * @desc Get Workflow Run Status
 * @access Public/Private
 */
router.get('/workflow-runs/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    const run = await WorkflowRun.findById(runId);
    if (!run) {
      return res.status(404).json({ error: 'Workflow Run not found' });
    }

    res.status(200).json({
      leadId: run.leadId,
      currentStep: run.currentStep,
      status: run.status
    });
  } catch (error) {
    console.error(`[Routes] Error fetching workflow run:`, error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;