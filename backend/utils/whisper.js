const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// Absolute path to your Python 3.13 install
const PYTHON_PATH = "C:\\Users\\VICTUS\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
const BRIDGE_SCRIPT = path.join(__dirname, 'transcribe.py');

/**
 * Runs Whisper via the Python bridge and returns the transcript text.
 * @param {string} audioFilePath - Absolute path to the audio file
 * @returns {Promise<string>} - Transcript text
 */
async function transcribeAudio(audioFilePath) {
  return new Promise((resolve, reject) => {
    // Validate path exists
    if (!fs.existsSync(audioFilePath)) {
      return reject(new Error(`Input file not found: ${audioFilePath}`));
    }

    const args = [BRIDGE_SCRIPT, audioFilePath];

    console.log(`[Whisper/Faster] Executing: ${PYTHON_PATH} ${args.join(' ')}`);

    execFile(PYTHON_PATH, args, { timeout: 600000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('[Whisper/Faster] Process Error:', error.message);
        console.error('[Whisper/Faster] stderr:', stderr);
        return reject(new Error(`Transcription tool failed. Ensure FFmpeg is installed and added to PATH.`));
      }

      try {
        const responseText = stdout.trim();
        if (!responseText) {
          return reject(new Error('Transcription engine returned no data. Check if FFmpeg is working correctly.'));
        }

        const data = JSON.parse(responseText);

        if (data.error) {
          return reject(new Error(`Engine error: ${data.error}`));
        }

        const text = data.text;
        if (!text || !text.trim()) {
           return reject(new Error('The audio file was processed but no speech was detected.'));
        }

        console.log(`[Whisper/Faster] Transcription success (${text.length} chars)`);
        resolve(text.trim());

      } catch (parseErr) {
        console.error('[Whisper/Faster] Parse Error:', parseErr.message, 'Output:', stdout);
        reject(new Error(`Failed to read transcription output. Make sure output is valid JSON.`));
      }
    });
  });
}

module.exports = { transcribeAudio };
