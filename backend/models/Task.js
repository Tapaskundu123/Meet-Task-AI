const mongoose = require('mongoose');

const agentMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    task_id: { type: String, required: true },
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
    agentMessages: [agentMessageSchema],
  },
  { timestamps: { createdAt: 'created_at' } }
);

module.exports = mongoose.model('Task', taskSchema);
