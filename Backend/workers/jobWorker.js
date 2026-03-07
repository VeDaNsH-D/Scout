const { Worker } = require('bullmq');
const { connection } = require('../services/scheduler');
const workflowEngine = require('../services/workflowEngine');
const replyTracker = require('../services/replyTracker');

/**
 * Initialize Job Worker
 * Processes jobs from the 'workflow-jobs' queue
 */
const initWorker = () => {
  const worker = new Worker('workflow-jobs', async job => {
    if (job.name === 'check-replies') {
      console.log(`[JobWorker] 📬 Running reply check…`);
      try {
        await replyTracker.processReplies();
      } catch (err) {
        console.error(`[JobWorker] ❌ Error checking replies:`, err);
        throw err;
      }
      return;
    }

    console.log(`[JobWorker] 👷 Processing job ${job.id} for step ${job.data.stepId}`);

    if (job.name === 'execute-step') {
      try {
        await workflowEngine.executeStep(job.data);
      } catch (err) {
        console.error(`[JobWorker] ❌ Error executing step:`, err);
        throw err;
      }
    }
  }, { connection });

  worker.on('completed', job => {
    console.log(`[JobWorker] ✅ Job ${job.id} completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[JobWorker] ❌ Job ${job?.id} failed with error:`, err.message);
  });

  worker.on('error', err => {
    console.error(`[JobWorker] ❌ Worker connection error:`, err);
  });

  console.log('[JobWorker] 👷 Workflow job worker initialized and listening for jobs.');

  return worker;
};

module.exports = { initWorker };
