const { Queue } = require('bullmq');

const redisUsername = process.env.REDIS_USERNAME || process.env.REDIS_USER;
const redisPassword = process.env.REDIS_PASSWORD || process.env.REDIS_PASS;
const redisTlsEnabled =
  String(process.env.REDIS_TLS || process.env.REDIS_USE_TLS || 'false').toLowerCase() === 'true';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  ...(redisUsername ? { username: redisUsername } : {}),
  ...(redisPassword ? { password: redisPassword } : {}),
  ...(redisTlsEnabled ? { tls: {} } : {}),
};

const workflowQueue = new Queue('workflow-jobs', { connection });

/**
 * Scheduler Service
 * Handles scheduling workflow actions, follow-up delays, and job queueing using BullMQ
 */
class Scheduler {
  /**
   * Schedule the next step in a workflow run
   * @param {Object} jobData - Information about the workflow run and next step
   * @param {number} delayMs - Delay in milliseconds before executing the job
   */
  async scheduleNextStep(jobData, delayMs = 0) {
    try {
      const jobId = `${jobData.workflowRunId}-${jobData.stepId}-${Date.now()}`;

      console.log(`[Scheduler] 🕒 Scheduling job ${jobId} with delay ${delayMs}ms`);

      const job = await workflowQueue.add(
        'execute-step',
        jobData,
        {
          jobId,
          delay: delayMs,
          removeOnComplete: true,
          removeOnFail: false
        }
      );

      return job;
    } catch (error) {
      console.error('[Scheduler] Error scheduling job:', error);
      throw error;
    }
  }

  /**
   * Parse wait time strings like "48h", "1d", "30m" into milliseconds
   * @param {string} waitString - The time string (e.g., "48h")
   * @returns {number} Milliseconds
   */
  parseWaitTime(waitString) {
    if (!waitString) return 0;

    const value = parseInt(waitString);
    if (isNaN(value)) return 0;

    if (waitString.includes('m')) return value * 60 * 1000;
    if (waitString.includes('h')) return value * 60 * 60 * 1000;
    if (waitString.includes('d')) return value * 24 * 60 * 60 * 1000;

    // Default to hours if no unit specified
    return value * 60 * 60 * 1000;
  }
}

module.exports = {
  scheduler: new Scheduler(),
  workflowQueue,
  connection
};