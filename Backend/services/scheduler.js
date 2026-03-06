const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Configure Redis connection
let connection;
if (process.env.REDIS_URL) {
  // If a URL is provided, ioredis accepts the URL string as the first argument
  // and the options object as the second argument.
  connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
} else {
  const connectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
  };
  if (process.env.REDIS_USERNAME) {
    connectionOptions.username = process.env.REDIS_USERNAME;
  }
  if (process.env.REDIS_PASSWORD) {
    connectionOptions.password = process.env.REDIS_PASSWORD;
  }
  connection = new Redis(connectionOptions);
}

connection.on('error', (err) => {
  console.error('[Redis] ❌ Connection error:', err.message);
});

connection.on('connect', () => {
  console.log('[Redis] ✅ Connected successfully.');
});

// Function to explicitly check Redis connection
const checkRedisConnection = async () => {
  try {
    const result = await connection.ping();
    if (result !== 'PONG') {
      throw new Error('Unexpected response from Redis ping');
    }
    return true;
  } catch (err) {
    console.error('[Redis] ❌ Ping failed:', err.message);
    throw err;
  }
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
  connection,
  checkRedisConnection
};
