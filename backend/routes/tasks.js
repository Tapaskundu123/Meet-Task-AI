const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { checkAndFollowUp } = require('../utils/agentJob');

// GET /api/tasks - List tasks with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, owner, member, meetingId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (owner) filter.owner = new RegExp(owner, 'i');
    if (member) filter.member = new RegExp(member, 'i');
    if (meetingId) filter.meeting = meetingId;

    const tasks = await Task.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('meeting', 'title created_at')
      .lean();

    const total = await Task.countDocuments(filter);

    res.json({ tasks, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', detail: err.message });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('meeting', 'title').lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task', detail: err.message });
  }
});

// PATCH /api/tasks/:id - Update task fields
router.patch('/:id', async (req, res) => {
  const allowed = [
    'description', 'owner', 'member', 'deadline', 'priority', 'status',
    'estimated_duration_hours', 'context', 'category', 'tags', 'success_criteria',
    'blockers', 'risk_level', 'effort_level', 'stakeholders', 'source_quote',
    'action_type', 'dependencies', 'notes',
  ];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }
  if (updates.deadline !== undefined) {
    updates.deadline = updates.deadline ? new Date(updates.deadline) : null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('meeting', 'title');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', detail: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', detail: err.message });
  }
});

// POST /api/tasks/agent/run - Manually trigger agent follow-up check
router.post('/agent/run', async (req, res) => {
  try {
    res.json({ message: 'Agent job triggered. Results will be available shortly.' });
    // Run after response to not block
    checkAndFollowUp().catch(err => console.error('[Agent manual run]', err.message));
  } catch (err) {
    res.status(500).json({ error: 'Agent run failed', detail: err.message });
  }
});

// GET /api/tasks/agent/messages - Get tasks with agent messages
router.get('/agent/messages', async (req, res) => {
  try {
    const tasks = await Task.find({ 'agentMessages.0': { $exists: true } })
      .sort({ 'agentMessages.generatedAt': -1 })
      .populate('meeting', 'title')
      .lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agent messages', detail: err.message });
  }
});

module.exports = router;
