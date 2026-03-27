const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v3.2';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `You are a meeting assistant that extracts actionable tasks from meeting transcripts.
You MUST return ONLY valid JSON. No markdown, no code fences, no extra text. Just raw JSON.

The JSON must follow this exact structure:
{
  "meeting_title": "string",
  "summary": "string",
  "tasks": [
    {
      "task_id": "unique-id",
      "description": "clear actionable task",
      "owner": "person name or unassigned",
      "member": "person name or unassigned",
      "deadline": "YYYY-MM-DD or null",
      "priority": "low or medium or high",
      "status": "pending",
      "estimated_duration_hours": 1,
      "confidence": 0.9
    }
  ]
}

Rules:
- Extract ONLY actionable items (ignore general discussion)
- Assign owner/member only if clearly mentioned by name
- Set deadline only if strongly implied (e.g. "by Friday", "next Monday")
- Estimate duration realistically
- Avoid duplicates
- Keep tasks concise and specific
- status is always "pending"
- Return ONLY the JSON object, nothing else`;

/**
 * Sends transcript to OpenRouter (DeepSeek V3.2) and returns the parsed meeting data with tasks.
 * @param {string} transcript
 * @param {number} retryCount
 * @returns {Promise<object>}
 */
async function extractTasksFromTranscript(transcript, retryCount = 0) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  console.log(`[LLM] Sending to OpenRouter (${OPENROUTER_MODEL}, attempt ${retryCount + 1})...`);

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Meeting transcript:\n${transcript}\n\nReturn the JSON:` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://insights.app', // Required by OpenRouter
          'X-Title': 'inSIGHTS AI', // Optional for OpenRouter rankings
          'Content-Type': 'application/json'
        },
        timeout: 150000 // 2.5 minutes
      }
    );

    const rawText = response.data?.choices?.[0]?.message?.content || '';
    if (!rawText) {
      throw new Error('OpenRouter returned an empty response.');
    }
    console.log('[LLM] Raw response length:', rawText.length);
    return rawText;
  } catch (err) {
    let message = err.message;

    if (err.response?.data?.error?.message) {
      message = err.response.data.error.message;
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      message = `Request timed out. OpenRouter might be slow or overloaded.`;
    }

    throw new Error(message || 'Unknown LLM error occurred');
  }
}

/**
 * Generates a follow-up message for an overdue task.
 * @param {object} task - Mongoose task document
 * @returns {Promise<string>}
 */
async function generateFollowUpMessage(task) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set.');
  }

  const prompt = `You are a professional project manager assistant.

Analyze the following task and generate a short, professional follow-up message (2-3 sentences max).
The task is overdue or has no recent update. Be concise, professional, and actionable.

Task:
- Description: ${task.description}
- Owner: ${task.owner}
- Deadline: ${task.deadline ? new Date(task.deadline).toDateString() : 'No deadline set'}
- Status: ${task.status}
- Priority: ${task.priority}

Return ONLY the follow-up message text, no JSON, no extra formatting.`;

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://insights.app',
          'X-Title': 'inSIGHTS AI'
        },
        timeout: 60000
      }
    );

    return (response.data?.choices?.[0]?.message?.content || '').trim();
  } catch (err) {
    console.error('[LLM] Follow-up generation failed:', err.response?.data?.error || err.message);
    return "Error generating follow-up. Please check manually.";
  }
}

module.exports = { extractTasksFromTranscript, generateFollowUpMessage };
