const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { transcribeAudio } = require('../utils/whisper');
const { extractTasksFromTranscript } = require('../utils/llm');
const { parseJSON, validateAndNormalize } = require('../utils/jsonParser');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// POST /api/upload - Upload audio file → Whisper → LLM → Store
router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded. Field name must be "audio".' });
  }

  const audioPath = req.file.path;
  console.log(`[Upload] Received file: ${req.file.originalname} → ${audioPath}`);

  let transcript;
  try {
    transcript = await transcribeAudio(audioPath);
  } catch (err) {
    console.error('[Upload] Whisper error:', err.message);
    return res.status(500).json({
      error: 'Transcription failed',
      detail: err.message,
      hint: 'Ensure Whisper is installed: pip install openai-whisper && pip install ffmpeg-python',
    });
  }

  let meetingData;
  try {
    meetingData = await processTranscript(transcript);
  } catch (err) {
    console.error('[Upload] LLM/parse error:', err.message);
    return res.status(500).json({ error: 'Task extraction failed', detail: err.message });
  }

  try {
    const result = await saveMeetingAndTasks(meetingData, transcript, req.file.originalname);
    return res.status(201).json(result);
  } catch (err) {
    console.error('[Upload] DB save error:', err.message);
    return res.status(500).json({ error: 'Database save failed', detail: err.message });
  }
});

// Shared helper: send to LLM, parse, validate
async function processTranscript(transcript, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const rawText = await extractTasksFromTranscript(transcript, attempt);
      const parsed = parseJSON(rawText);
      return validateAndNormalize(parsed);
    } catch (err) {
      lastError = err;
      console.warn(`[processTranscript] Attempt ${attempt + 1} failed: ${err.message}`);
    }
  }
  throw lastError;
}

// Shared helper: persist meeting + tasks to MongoDB
async function saveMeetingAndTasks(meetingData, transcript, audioFile = null) {
  const meeting = new Meeting({
    title: meetingData.meeting_title,
    summary: meetingData.summary,
    transcript,
    audioFile,
  });

  const savedTasks = [];
  for (const t of meetingData.tasks) {
    const task = new Task({
      meeting: meeting._id,
      ...t,
      deadline: t.deadline ? new Date(t.deadline) : null,
    });
    await task.save();
    savedTasks.push(task);
    meeting.tasks.push(task._id);
  }

  await meeting.save();

  return {
    meeting: {
      id: meeting._id,
      title: meeting.title,
      summary: meeting.summary,
      taskCount: savedTasks.length,
    },
    tasks: savedTasks,
  };
}

module.exports = router;
module.exports.processTranscript = processTranscript;
module.exports.saveMeetingAndTasks = saveMeetingAndTasks;
