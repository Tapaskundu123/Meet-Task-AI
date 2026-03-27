const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled Meeting' },
    summary: { type: String, default: '' },
    transcript: { type: String, required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    audioFile: { type: String, default: null }, // original filename if uploaded
  },
  { timestamps: { createdAt: 'created_at' } }
);

module.exports = mongoose.model('Meeting', meetingSchema);
