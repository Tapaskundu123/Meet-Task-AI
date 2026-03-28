const { v4: uuidv4 } = require('uuid');

const VALID_PRIORITIES    = ['low', 'medium', 'high'];
const VALID_STATUSES      = ['pending', 'in-progress', 'done'];
const VALID_RISK_LEVELS   = ['low', 'medium', 'high', 'critical'];
const VALID_EFFORT_LEVELS = ['trivial', 'small', 'medium', 'large', 'epic'];
const VALID_CATEGORIES    = [
  'engineering', 'design', 'marketing', 'product', 'operations',
  'hr', 'finance', 'research', 'qa', 'devops', 'leadership', 'general'
];
const VALID_ACTION_TYPES  = [
  'build', 'research', 'review', 'design', 'test', 'fix',
  'deploy', 'communicate', 'plan', 'hire', 'document', 'follow-up', 'other'
];

/**
 * Robustly parses LLM JSON output with multiple fallback strategies.
 */
function parseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid LLM response');
  }

  // Strategy 1: Direct parse
  try { return JSON.parse(rawText.trim()); } catch (_) {}

  // Strategy 2: Extract from markdown code fences
  const codeFenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeFenceMatch) {
    try { return JSON.parse(codeFenceMatch[1].trim()); } catch (_) {}
  }

  // Strategy 3: Extract first complete {...} block
  const braceMatch = rawText.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]); } catch (_) {}
  }

  // Strategy 4: Fix common JSON issues
  try {
    let fixed = rawText
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":')
      .match(/\{[\s\S]*\}/)?.[0];
    if (fixed) return JSON.parse(fixed);
  } catch (_) {}

  throw new Error('Could not parse JSON from LLM response after all strategies');
}

/**
 * Validates and normalises the parsed meeting object.
 * Maps all enriched fields from the LLM output while applying sensible defaults.
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
    // ── Core fields ────────────────────────────────────────────────────
    task_id:                  t.task_id || `task-${uuidv4()}`,
    description:              t.description || `Task ${idx + 1}`,
    owner:                    t.owner   || 'unassigned',
    member:                   t.member  || t.owner || 'unassigned',
    deadline:                 t.deadline && t.deadline !== 'null' ? t.deadline : null,
    priority:                 VALID_PRIORITIES.includes(t.priority) ? t.priority : 'medium',
    status:                   'pending',
    estimated_duration_hours: Number(t.estimated_duration_hours) || 1,
    confidence:               Math.min(1, Math.max(0, Number(t.confidence) || 0.8)),

    // ── Enriched fields ────────────────────────────────────────────────
    context:          typeof t.context === 'string' ? t.context.trim() : null,
    category:         VALID_CATEGORIES.includes(t.category) ? t.category : 'general',
    tags:             Array.isArray(t.tags) ? t.tags.filter(x => typeof x === 'string').slice(0, 8) : [],
    success_criteria: typeof t.success_criteria === 'string' ? t.success_criteria.trim() : null,
    blockers:         typeof t.blockers === 'string' && t.blockers !== 'null' ? t.blockers.trim() : null,
    risk_level:       VALID_RISK_LEVELS.includes(t.risk_level) ? t.risk_level : 'low',
    effort_level:     VALID_EFFORT_LEVELS.includes(t.effort_level) ? t.effort_level : 'small',
    stakeholders:     Array.isArray(t.stakeholders) ? t.stakeholders.filter(x => typeof x === 'string') : [],
    source_quote:     typeof t.source_quote === 'string' ? t.source_quote.trim().slice(0, 400) : null,
    action_type:      VALID_ACTION_TYPES.includes(t.action_type) ? t.action_type : 'other',
    dependencies:     Array.isArray(t.dependencies) ? t.dependencies.filter(x => typeof x === 'string') : [],
    notes:            typeof t.notes === 'string' && t.notes !== 'null' ? t.notes.trim() : null,
  }));

  return meeting;
}

module.exports = { parseJSON, validateAndNormalize };
