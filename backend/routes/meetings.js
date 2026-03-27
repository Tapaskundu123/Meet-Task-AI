const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { processTranscript, saveMeetingAndTasks } = require('./upload');

// POST /api/meetings/text - Submit raw transcript/text
router.post('/text', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'No transcript text provided.' });
  }
  if (transcript.trim().length < 20) {
    return res.status(400).json({ error: 'Transcript too short to extract tasks.' });
  }

  let meetingData;
  try {
    meetingData = await processTranscript(transcript.trim());
  } catch (err) {
    console.error('[Meetings/text] LLM error:', err.message);
    return res.status(500).json({ error: 'Task extraction failed', detail: err.message });
  }

  try {
    const result = await saveMeetingAndTasks(meetingData, transcript.trim());
    return res.status(201).json(result);
  } catch (err) {
    console.error('[Meetings/text] DB error:', err.message);
    return res.status(500).json({ error: 'Database save failed', detail: err.message });
  }
});

// GET /api/meetings - List all meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .sort({ created_at: -1 })
      .populate('tasks', 'status priority description owner deadline')
      .lean();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meetings', detail: err.message });
  }
});

// GET /api/meetings/:id - Get single meeting with full tasks
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('tasks')
      .lean();
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meeting', detail: err.message });
  }
});

// DELETE /api/meetings/:id - Delete meeting and its tasks
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    const { Task } = require('../models/Task');
    await Task.deleteMany({ meeting: meeting._id });
    await meeting.deleteOne();
    res.json({ message: 'Meeting and tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete meeting', detail: err.message });
  }
});

module.exports = router;
