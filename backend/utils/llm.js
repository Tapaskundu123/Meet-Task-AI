const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v3.2';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `You are an expert AI meeting analyst. Your job is to extract highly detailed, actionable tasks from meeting transcripts and return them as structured JSON.

You MUST return ONLY valid JSON. No markdown, no code fences, no preamble. Just raw JSON.

The JSON must follow this EXACT structure:
{
  "meeting_title": "Concise title describing the meeting topic",
  "summary": "2–3 sentence summary of the meeting's purpose and key outcomes",
  "tasks": [
    {
      "task_id": "unique-slug-id (e.g. task-implement-auth)",
      "description": "Clear, specific, actionable task description starting with a verb",
      "owner": "Full name of primary responsible person, or 'unassigned'",
      "member": "Full name of supporting collaborator, or 'unassigned'",
      "deadline": "YYYY-MM-DD or null",
      "priority": "low | medium | high",
      "status": "pending",
      "estimated_duration_hours": 2,
      "confidence": 0.92,
      "context": "1–2 sentences explaining WHY this task is needed and what business value it delivers",
      "category": "engineering | design | marketing | product | operations | hr | finance | research | qa | devops | leadership | general",
      "tags": ["tag1", "tag2"],
      "success_criteria": "Specific, measurable definition of 'done' for this task",
      "blockers": "Any mentioned dependencies, blockers or prerequisite conditions, or null",
      "risk_level": "low | medium | high | critical",
      "effort_level": "trivial | small | medium | large | epic",
      "stakeholders": ["name1", "name2"],
      "source_quote": "The exact verbatim sentence or phrase from the transcript that led to this task",
      "action_type": "build | research | review | design | test | fix | deploy | communicate | plan | hire | document | follow-up | other",
      "dependencies": [],
      "notes": "Any other relevant context, caveats, or observations about this task"
    }
  ]
}

Extraction Rules:
- Extract ONLY clearly actionable items — skip general chit-chat, pleasantries, or vague ideas
- Set owner/member ONLY if a real person is explicitly named or strongly implied
- Derive deadline from cues like "by Friday", "end of month", "next sprint", "in 2 weeks" relative to today if mentioned
- Set confidence based on how clearly the task was stated: 1.0 = explicitly assigned, 0.5 = inferred, 0.3 = speculative
- risk_level: high/critical for tasks blocking others or with tight deadlines
- effort_level: trivial (<30min), small(0.5–2h), medium(2–8h), large(1–3d), epic(>3d)
- source_quote: copy the exact phrase from the transcript that inspired this task (max 200 chars)
- tags: 2–5 relevant keywords like ["api", "authentication", "backend"]
- Extract ALL stakeholders referenced in context of this task
- Set category to the most fitting department/function
- action_type: single best verb category for the task
- dependencies: leave empty array unless task explicitly depends on another extracted task_id
- notes: add any nuance, caveats, or important context NOT captured elsewhere
- Avoid duplicates; merge similar tasks
- status is always "pending"
- Return ONLY the JSON, nothing else`;

/**
 * Sends transcript to OpenRouter (DeepSeek V3.2) and returns raw JSON text.
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
          {
            role: 'user',
            content: `Today's date: ${new Date().toISOString().split('T')[0]}\n\nMeeting transcript:\n${transcript}\n\nExtract all tasks and return the JSON:`
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://insights.app',
          'X-Title': 'inSIGHTS AI',
          'Content-Type': 'application/json'
        },
        timeout: 150000
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
      message = 'Request timed out. OpenRouter might be slow or overloaded.';
    }
    throw new Error(message || 'Unknown LLM error occurred');
  }
}

/**
 * Generates a follow-up message for an overdue/stale task using full context.
 */
async function generateFollowUpMessage(task) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set.');
  }

  const prompt = `You are a professional project manager AI assistant.

Analyze this overdue/stale task and generate a concise, professional follow-up message (2-3 sentences).
Be specific, reference the task's context and risk level. Be direct and actionable.

Task Details:
- Description: ${task.description}
- Owner: ${task.owner}
- Deadline: ${task.deadline ? new Date(task.deadline).toDateString() : 'No deadline set'}
- Status: ${task.status}
- Priority: ${task.priority}
- Risk Level: ${task.risk_level || 'unknown'}
- Context: ${task.context || 'Not specified'}
- Success Criteria: ${task.success_criteria || 'Not specified'}
- Blockers: ${task.blockers || 'None known'}

Return ONLY the follow-up message text. No JSON, no formatting.`;

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 250
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
    return 'Error generating follow-up. Please check manually.';
  }
}

module.exports = { extractTasksFromTranscript, generateFollowUpMessage };
