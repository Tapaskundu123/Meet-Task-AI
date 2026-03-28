const mongoose = require('mongoose');

const agentMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    task_id: { type: String, required: true },

    // Core task fields
    description: { type: String, required: true },
    owner: { type: String, default: 'unassigned' },
    member: { type: String, default: 'unassigned' },
    deadline: { type: Date, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'done'],
      default: 'pending',
    },
    estimated_duration_hours: { type: Number, default: 1 },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },

    // ── ENRICHED FIELDS ──────────────────────────────────────────────────
    // Context extracted from transcript
    context: { type: String, default: null },           // Why this task matters / background
    category: { type: String, default: 'general' },     // e.g. "engineering", "design", "marketing"
    tags: [{ type: String }],                           // Freeform labels extracted by LLM
    success_criteria: { type: String, default: null },  // Definition of done
    blockers: { type: String, default: null },          // Known dependencies or blockers
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    effort_level: {
      type: String,
      enum: ['trivial', 'small', 'medium', 'large', 'epic'],
      default: 'small',
    },
    stakeholders: [{ type: String }],                  // People mentioned in relation to this task
    source_quote: { type: String, default: null },      // Verbatim quote from transcript
    action_type: { type: String, default: null },       // e.g. "follow-up", "research", "build", "review"
    dependencies: [{ type: String }],                  // Other task_ids this depends on
    notes: { type: String, default: null },             // Additional LLM notes

    // Agent loop
    agentMessages: [agentMessageSchema],
  },
  { timestamps: { createdAt: 'created_at' } }
);

module.exports = mongoose.model('Task', taskSchema);
