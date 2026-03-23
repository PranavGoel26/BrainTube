


import os
import json
import subprocess
from moviepy import VideoFileClip
from groq import Groq
from concurrent.futures import ThreadPoolExecutor

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ======================================
# Extract audio from video
# ======================================
def extract_audio(video_path, output_audio_path="/tmp/temp_audio.wav"):

    video = VideoFileClip(video_path)
    video.audio.write_audiofile(output_audio_path)

    return output_audio_path


# ======================================
# Split audio into chunks
# ======================================
def split_audio(audio_path, chunk_length=60):

    os.makedirs("/tmp/audio_chunks", exist_ok=True)

    command = [
        "ffmpeg",
        "-i", audio_path,
        "-f", "segment",
        "-segment_time", str(chunk_length),
        "-c", "copy",
        "/tmp/audio_chunks/chunk_%03d.wav"
    ]

    subprocess.run(command)

    return "/tmp/audio_chunks"


# ======================================
# Transcribe a single chunk
# ======================================


import time
from concurrent.futures import ThreadPoolExecutor


# ======================================
# Transcribe one chunk with retry
# ======================================
def transcribe_single_chunk(path):

    for attempt in range(3):

        try:
            with open(path, "rb") as audio:

                response = client.audio.transcriptions.create(
                    file=audio,
                    model="whisper-large-v3"
                )

            return response.text

        except Exception as e:

            print(f"Retry {attempt+1} for {path}")
            time.sleep(2)

    print(f"Failed transcription for {path}")

    return None


# ======================================
# Parallel transcription
# ======================================
def transcribe_audio_chunks(folder, max_workers=3):

    files = sorted(os.listdir(folder))

    transcript = []
    current_time = 0

    print(f"Found {len(files)} audio chunks")

    with ThreadPoolExecutor(max_workers=max_workers) as executor:

        results = executor.map(
            transcribe_single_chunk,
            [os.path.join(folder, f) for f in files]
        )

        for i, text in enumerate(results):

            print(f"Processed chunk {i+1}/{len(files)}")

            if text is None:
                text = ""

            transcript.append({
                "start": current_time,
                "end": current_time + 300,
                "text": text
            })

            current_time += 300

    return transcript


# ======================================
# Save transcript
# ======================================
def save_transcript(transcript, output_file="/tmp/transcript.json"):

    with open(output_file, "w") as f:
        json.dump(transcript, f, indent=4)

    print("Transcript saved:", output_file)


# ======================================
# Full pipeline for local video
# ======================================
def process_video(video_path):

    print("Extracting audio...")
    audio_path = extract_audio(video_path)

    print("Splitting audio...")
    chunks_folder = split_audio(audio_path)

    print("Transcribing chunks in parallel...")
    transcript = transcribe_audio_chunks(chunks_folder)

    print("Saving transcript...")
    save_transcript(transcript)

    return transcript