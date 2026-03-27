import sys
import json
import os
from faster_whisper import WhisperModel

def transcribe(audio_path, model_size="base"):
    try:
        # Check if file exists
        if not os.path.exists(audio_path):
            print(json.dumps({"error": f"File not found: {audio_path}"}))
            return

        # Initialize model (using CPU for maximum compatibility, can switch to 'cuda' if GPU is confirmed)
        model = WhisperModel(model_size, device="cpu", compute_type="int8")

        segments, info = model.transcribe(audio_path, beam_size=5)

        full_text = []
        for segment in segments:
            full_text.append(segment.text)

        result = {
            "text": " ".join(full_text).strip(),
            "language": info.language,
            "duration": info.duration
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio path provided"}))
    else:
        transcribe(sys.argv[1])
