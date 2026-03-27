const { StateGraph, Annotation } = require('@langchain/langgraph');
const { ChatOpenAI } = require('@langchain/openai');
const { sendTaskNotification } = require('./email');

// Define the state for our task agent
const TaskState = Annotation.Root({
  task: Annotation({ reducer: (a, b) => b }),
  action: Annotation({ reducer: (a, b) => b }),
  reasoning: Annotation({ reducer: (a, b) => b }),
  result: Annotation({ reducer: (a, b) => b, default: () => null }),
});

const llm = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v3.2',
  configuration: {
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  },
  temperature: 0.2,
});

/**
 * Node: Analyst
 * Decides if the task needs attention and what action to take.
 */
async function analystNode(state) {
  const { task } = state;
  console.log(`[LangGraph] Analyzing task: ${task.task_id}`);

  const prompt = `You are an AI Task Tracker. Analyze the following task and decide if it needs a notification.
Rule: 
- If the task is overdue (deadline passed) AND status is not 'done' -> action: "NOTIFY"
- If the task is stale (over 7 days old) -> action: "NOTIFY"
- Otherwise -> action: "WAIT"

Task:
- Description: ${task.description}
- Owner: ${task.owner}
- Member: ${task.member}
- Deadline: ${task.deadline}
- Status: ${task.status}
- Last Update: ${task.updated_at}

Return ONLY JSON: { "action": "NOTIFY" | "WAIT", "reason": "why" }`;

  try {
    const response = await llm.invoke(prompt);
    const content = response.content;
    const { action, reason } = JSON.parse(content.replace(/```json|```/g, '').trim());
    
    return { 
      action,
      reasoning: reason
    };
  } catch (err) {
    console.error('[LangGraph] Analyst error:', err.message);
    return { action: 'WAIT', reasoning: 'error in analysis' };
  }
}

/**
 * Node: Dispatcher
 * Sends notifications if requested.
 */
async function dispatcherNode(state) {
  const { task, action, reasoning } = state;
  
  if (action === 'NOTIFY') {
    const subject = `Attention: Task "${task.description}" needs your update`;
    const text = `Hi ${task.member || task.owner},\n\nOur system detected that your task needs attention.\nAction: ${reasoning}\n\nTask Detail: ${task.description}\nStatus: ${task.status}\nDeadline: ${task.deadline}\n\nPlease update your progress in inSIGHTS AI.`;
    
    // We mock the user email as member_name@example.com for demonstration 
    // unless a real email is found in member string
    const emailTo = task.member && task.member.includes('@') ? task.member : 'member@example.com';
    
    const res = await sendTaskNotification(emailTo, subject, text);
    return { result: res.success ? 'Notification sent' : 'Notification failed' };
  }

  return { result: 'No action needed' };
}

// Build the graph
const workflow = new StateGraph(TaskState)
  .addNode('analyst', analystNode)
  .addNode('dispatcher', dispatcherNode)
  .addEdge('__start__', 'analyst')
  .addEdge('analyst', 'dispatcher')
  .addEdge('dispatcher', '__end__');

const agent = workflow.compile();

/**
 * Runs the agentic workflow for a single task.
 * @param {object} task 
 */
async function runTaskAgent(task) {
  try {
    const finalState = await agent.invoke({ task });
    console.log(`[LangGraph] Finished for task ${task.task_id}: ${finalState.result}`);
    return finalState;
  } catch (err) {
    console.error('[LangGraph] Agent execution failed:', err.message);
    throw err;
  }
}

module.exports = { runTaskAgent };
