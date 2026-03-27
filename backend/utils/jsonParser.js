const { v4: uuidv4 } = require('uuid');

/**
 * Robustly parses LLM JSON output with multiple fallback strategies.
 * @param {string} rawText - Raw LLM output
 * @returns {object} - Parsed object
 */
function parseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid LLM response');
  }

  // Strategy 1: Direct parse
  try {
    return JSON.parse(rawText.trim());
  } catch (_) {}

  // Strategy 2: Extract from markdown code fences (```json ... ```)
  const codeFenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeFenceMatch) {
    try {
      return JSON.parse(codeFenceMatch[1].trim());
    } catch (_) {}
  }

  // Strategy 3: Extract first complete {...} block
  const braceMatch = rawText.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (_) {}
  }

  // Strategy 4: Try to fix common JSON issues (trailing commas, single quotes)
  try {
    let fixed = rawText
      .replace(/,\s*([}\]])/g, '$1')   // trailing commas
      .replace(/'/g, '"')               // single to double quotes
      .replace(/(\w+):/g, '"$1":')      // unquoted keys
      .match(/\{[\s\S]*\}/)?.[0];
    if (fixed) return JSON.parse(fixed);
  } catch (_) {}

  throw new Error('Could not parse JSON from LLM response after all strategies');
}

/**
 * Validates and normalises the parsed meeting object.
 * Ensures tasks have required fields and sensible defaults.
 */
function validateAndNormalize(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Parsed result is not an object');
  }

  const meeting = {
    meeting_title: parsed.meeting_title || 'Meeting ' + new Date().toLocaleDateString(),
    summary: parsed.summary || '',
    tasks: [],
  };

  const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

  meeting.tasks = rawTasks.map((t, idx) => ({
    task_id: t.task_id || `task-${uuidv4()}`,
    description: t.description || `Task ${idx + 1}`,
    owner: t.owner || 'unassigned',
    member: t.member || t.owner || 'unassigned',
    deadline: t.deadline && t.deadline !== 'null' ? t.deadline : null,
    priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
    status: 'pending',
    estimated_duration_hours: Number(t.estimated_duration_hours) || 1,
    confidence: Math.min(1, Math.max(0, Number(t.confidence) || 0.8)),
  }));

  return meeting;
}

module.exports = { parseJSON, validateAndNormalize };
