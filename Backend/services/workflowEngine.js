const Workflow = require('../models/Workflow');
const WorkflowRun = require('../models/WorkflowRun');
const Lead = require('../models/Lead');
const Message = require('../models/Message');
const emailService = require('./emailService');
const { scheduler } = require('./scheduler');

/**
 * Workflow Engine Service
 * Responsibilities: read workflow nodes, execute actions, handle conditions, move to next step
 */
class WorkflowEngine {
  /**
   * Initializes a workflow run for multiple leads
   * @param {string} workflowId 
   * @param {string[]} leadIds 
   */
  async startWorkflow(workflowId, leadIds) {
    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) throw new Error('Workflow not found');

      console.log(`[WorkflowEngine] 🚀 Starting workflow: ${workflow.name} for ${leadIds.length} leads`);

      const startNode = workflow.nodes.find(n => n.type === 'start');
      if (!startNode) throw new Error('Workflow has no start node');

      const runs = [];

      for (const leadId of leadIds) {
        // Create workflow run record
        const run = new WorkflowRun({
          workflowId,
          leadId,
          currentStep: startNode.id,
          status: 'running'
        });
        
        await run.save();
        runs.push(run);

        // Schedule first step immediately
        await scheduler.scheduleNextStep({
          workflowRunId: run._id.toString(),
          workflowId,
          leadId,
          stepId: startNode.id
        }, 0);
      }

      return runs;
    } catch (error) {
      console.error('[WorkflowEngine] Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Executes a single step of a workflow run
   * @param {Object} jobData 
   */
  async executeStep(jobData) {
    const { workflowRunId, workflowId, leadId, stepId } = jobData;

    try {
      console.log(`[WorkflowEngine] ⚙️ Executing step ${stepId} for run ${workflowRunId}`);

      const run = await WorkflowRun.findById(workflowRunId);
      if (!run || run.status !== 'running') {
        console.log(`[WorkflowEngine] ⚠️ Run ${workflowRunId} is not running. Status: ${run?.status}`);
        return;
      }

      const workflow = await Workflow.findById(workflowId);
      const lead = await Lead.findById(leadId);

      if (!workflow || !lead) {
        throw new Error('Workflow or Lead not found during execution');
      }

      const currentNode = workflow.nodes.find(n => n.id === stepId);
      if (!currentNode) {
        run.status = 'completed';
        await run.save();
        return;
      }

      run.currentStep = stepId;
      await run.save();

      // Execute node logic based on type
      await this._processNode(currentNode, lead, workflow, run);

      // Find next node(s) based on edges
      const nextEdges = workflow.edges.filter(e => e.source === stepId);
      
      if (nextEdges.length === 0) {
        console.log(`[WorkflowEngine] Workflow run ${workflowRunId} completed`);
        run.status = 'completed';
        await run.save();
        return;
      }

      // Schedule next steps
      for (const edge of nextEdges) {
        const nextNodeId = edge.target;
        const nextNode = workflow.nodes.find(n => n.id === nextNodeId);
        
        if (nextNode) {
          let delayMs = 0;
          
          if (nextNode.type === 'wait') {
            delayMs = scheduler.parseWaitTime(nextNode.data?.waitTime || '0h');
          }

          await scheduler.scheduleNextStep({
            workflowRunId: run._id.toString(),
            workflowId,
            leadId,
            stepId: nextNodeId
          }, delayMs);
        }
      }

    } catch (error) {
      console.error(`[WorkflowEngine] Error executing step ${stepId}:`, error);
      await WorkflowRun.findByIdAndUpdate(workflowRunId, { status: 'failed' });
      throw error;
    }
  }

  /**
   * Internal method to process specific node types
   */
  async _processNode(node, lead, workflow, run) {
    switch (node.type) {
      case 'start':
        console.log(`[WorkflowEngine] Flow started for lead ${lead.email}`);
        break;

      case 'email':
        const subject = node.data?.subject || 'No Subject';
        const messageBody = node.data?.body || 'Hello...';
        
        await emailService.sendEmail(lead.email, subject, messageBody);
        
        // Save message record
        await Message.create({
          leadId: lead._id,
          channel: 'email',
          subject,
          content: messageBody,
          sentAt: new Date()
        });
        break;

      case 'wait':
        console.log(`[WorkflowEngine] Waiting... (Delay handled by scheduler before execution)`);
        break;

      case 'condition':
        // Simple condition mock logic
        // In reality, this would evaluate actual conditions
        console.log(`[WorkflowEngine] Evaluating condition for lead ${lead.email}`);
        break;

      default:
        console.log(`[WorkflowEngine] Unknown node type: ${node.type}`);
    }
  }
}

module.exports = new WorkflowEngine();