const Workflow = require('../schemas/workflow_schema');
const WorkflowRun = require('../schemas/workflow_run_schema');
const Lead = require('../schemas/lead_schema');
const Message = require('../schemas/message_schema');
const emailService = require('./emailService');
const { generateEmail } = require('./llmService');
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

      const nodeList = Array.isArray(workflow.nodes) ? workflow.nodes : [];
      const edgeList = Array.isArray(workflow.edges) ? workflow.edges : [];
      const incomingTargets = new Set(edgeList.map((edge) => String(edge?.target || '')));

      const startNode =
        nodeList.find((node) => node?.type === 'start') ||
        nodeList.find((node) => node?.type === 'trigger') ||
        nodeList.find((node) => node?.data?.category === 'trigger') ||
        nodeList.find((node) => !incomingTargets.has(String(node?.id || ''))) ||
        nodeList[0];

      if (!startNode) throw new Error('Workflow has no nodes to execute');

      const runs = [];

      for (const leadId of leadIds) {
        // Create workflow run record
        const run = new WorkflowRun({
          workflow_id: workflowId,
          lead_id: leadId,
          current_node: startNode.id,
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

      if (lead.status === 'replied' || lead.status === 'converted') {
        console.log(`[WorkflowEngine] Stopping run ${workflowRunId} for lead ${lead.email}: lead is ${lead.status}`);
        run.status = 'completed';
        await run.save();
        return;
      }

      const currentNode = workflow.nodes.find(n => n.id === stepId);
      if (!currentNode) {
        run.status = 'completed';
        await run.save();
        return;
      }

      run.current_node = stepId;
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
            const delayHours = Number(nextNode.data?.config?.delayHours || 0);
            if (Number.isFinite(delayHours) && delayHours > 0) {
              delayMs = delayHours * 60 * 60 * 1000;
            } else {
              delayMs = scheduler.parseWaitTime(nextNode.data?.waitTime || '0h');
            }
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

      case 'trigger':
        // Trigger nodes are event markers; execution simply advances to outgoing edges.
        console.log(`[WorkflowEngine] Trigger node reached for lead ${lead.email}`);
        break;

      case 'action':
        // Send email when the action is configured for email channel or appears email-related by label.
        {
          const actionLabel = String(node.data?.label || node.label || 'Action');
          const channel = String(node.data?.config?.channel || '').toLowerCase().trim();
          const shouldEmail = channel === 'email' || /email|follow\s*-?\s*up|confirmation|send/i.test(actionLabel);

          if (shouldEmail) {
            if (!lead.email) {
              console.log(`[WorkflowEngine] Skipping email action for lead ${lead._id}: missing email address`);
              break;
            }

            // Determine email type from node label/config
            const emailType = this._resolveEmailType(node);

            // Build campaign context from workflow metadata or node config
            const campaignContext = this._buildCampaignContext(node, workflow);

            // Generate personalized email using Llama3
            console.log(`[WorkflowEngine] 🤖 Generating personalized ${emailType} for lead ${lead.email} using Llama3...`);
            const generated = await generateEmail(lead, lead.insights || [], campaignContext, emailType);

            const subject = node.data?.config?.subject || generated.subject;
            const messageBody = generated.body;

            console.log(`[WorkflowEngine] 📧 Sending AI-generated email to ${lead.email}`);
            const result = await emailService.sendEmail(lead.email, subject, messageBody);

            await Message.create({
              lead_id: lead._id,
              workflow_run_id: run._id,
              channel: 'email',
              direction: 'outgoing',
              content: messageBody,
              sent_at: new Date(),
              status: result.success ? 'sent' : 'failed',
            });

            await this._markLeadContacted(lead, result.success);

            break;
          }

          console.log(`[WorkflowEngine] Action node executed for lead ${lead.email}`);
        }
        break;

      case 'decision':
        // Decision branching is represented by outgoing edges; evaluation logic can be added later.
        console.log(`[WorkflowEngine] Decision node evaluated for lead ${lead.email}`);
        break;

      case 'email':
        {
          if (!lead.email) {
            console.log(`[WorkflowEngine] Skipping email node for lead ${lead._id}: missing email address`);
            break;
          }

          // Determine email type from node data
          const emailType = this._resolveEmailType(node);

          // Build campaign context from workflow metadata or node config
          const campaignContext = this._buildCampaignContext(node, workflow);

          // Generate personalized email using Llama3
          console.log(`[WorkflowEngine] 🤖 Generating personalized ${emailType} for lead ${lead.email} using Llama3...`);
          const generated = await generateEmail(lead, lead.insights || [], campaignContext, emailType);

          const subject = node.data?.subject || node.data?.config?.subject || generated.subject;
          const messageBody = generated.body;

          console.log(`[WorkflowEngine] 📧 Sending AI-generated email to ${lead.email}`);
          const result = await emailService.sendEmail(lead.email, subject, messageBody);

          // Save message record
          await Message.create({
            lead_id: lead._id,
            workflow_run_id: run._id,
            channel: 'email',
            direction: 'outgoing',
            content: messageBody,
            sent_at: new Date(),
            status: result.success ? 'sent' : 'failed',
          });

          await this._markLeadContacted(lead, result.success);
        }
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

  /**
   * Resolve the email type based on node label/config
   * Maps workflow node labels to email sequence types
   */
  _resolveEmailType(node) {
    const label = String(node.data?.label || node.label || '').toLowerCase();
    const configType = String(node.data?.config?.emailType || node.data?.emailType || '').toLowerCase();

    // Check explicit config first
    if (configType && ['cold_email', 'followup_1', 'followup_2', 'final_followup'].includes(configType)) {
      return configType;
    }

    // Infer from label
    if (/final|last|closing/i.test(label)) return 'final_followup';
    if (/second\s*follow|follow\s*-?\s*up\s*2|2nd/i.test(label)) return 'followup_2';
    if (/follow\s*-?\s*up|reminder/i.test(label)) return 'followup_1';
    return 'cold_email';
  }

  /**
   * Build campaign context from workflow and node metadata
   */
  _buildCampaignContext(node, workflow) {
    const nodeConfig = node.data?.config || {};
    return {
      team_name: nodeConfig.team_name || workflow.name || 'Our Team',
      product_name: nodeConfig.product_name || 'Our Product',
      product_description: nodeConfig.product_description || 'A platform to help your business grow',
      pain_point: nodeConfig.pain_point || 'improving efficiency and outcomes',
      goal: nodeConfig.goal || 'a short introductory call',
    };
  }

  async _markLeadContacted(lead, emailSent) {
    if (!emailSent || !lead || lead.status !== 'new') {
      return;
    }

    lead.status = 'contacted';
    await lead.save();
  }
}

module.exports = new WorkflowEngine();
