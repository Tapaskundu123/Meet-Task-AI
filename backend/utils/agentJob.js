const cron = require('node-cron');
const Task = require('../models/Task');
const { runTaskAgent } = require('./langgraphAgent');

/**
 * Starts the background agent job that checks overdue/stale tasks
 * and executes agentic LangGraph workflows for tracking/notifications.
 */
function startAgentJob() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[Agent] Running task check at', new Date().toISOString());
    await checkAndFollowUp();
  });

  console.log('[Agent] LangGraph Background job scheduled (every hour)');
}

async function checkAndFollowUp() {
  const now = new Date();

  try {
    // Find tasks that need some attention
    const overdueTasks = await Task.find({
      status: { $ne: 'done' },
      deadline: { $lt: now, $ne: null },
    }).limit(10);

    const staleLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const staleTasks = await Task.find({
      status: 'pending',
      deadline: null,
      updated_at: { $lt: staleLimit },
    }).limit(10);

    const tasksToProcess = [...overdueTasks, ...staleTasks];

    console.log(`[Agent] Processing ${tasksToProcess.length} tasks through LangGraph...`);

    for (const task of tasksToProcess) {
      try {
        const result = await runTaskAgent(task);
        if (result && result.result === 'Notification sent') {
          task.agentMessages.push({ 
            message: `LangGraph: Notification triggered based on analysis: ${result.reasoning}`, 
            generatedAt: now 
          });
          await task.save();
        }
      } catch (taskErr) {
        console.error(`[Agent] Failed for task ${task.task_id}:`, taskErr.message);
      }
    }
  } catch (err) {
    console.error('[Agent] Job error:', err.message);
  }
}

// Export for manual trigger via API
module.exports = { startAgentJob, checkAndFollowUp };
