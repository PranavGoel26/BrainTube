import yt_dlp
import os
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter

from cache_utils import transcript_exists, load_transcript, save_transcript


# ----------------------------------
# Extract video ID safely
# ----------------------------------
def get_video_id(url):

    if "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]

    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]

    return None


# ----------------------------------
# Fetch captions from YouTube
# ----------------------------------
def get_captions(video_id):

    try:

        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # 1️⃣ Prefer manually created captions
        for transcript in transcript_list:

            if not transcript.is_generated:

                print("Manual captions found")

                data = transcript.fetch()

                return [
                    {
                        "start": seg["start"],
                        "end": seg["start"] + seg["duration"],
                        "text": seg["text"]
                    }
                    for seg in data
                ]

        # 2️⃣ Fallback to auto captions
        for transcript in transcript_list:

            if transcript.is_generated:

                print("Auto-generated captions found")

                data = transcript.fetch()

                return [
                    {
                        "start": seg["start"],
                        "end": seg["start"] + seg["duration"],
                        "text": seg["text"]
                    }
                    for seg in data
                ]

        return None

    except Exception as e:

        print("Caption retrieval failed:", e)

        return None


# ----------------------------------
# Download audio using yt-dlp
# ----------------------------------
def download_audio(url):

    output = "/tmp/temp_audio.wav"

    cookie_path = "cookies.txt"
    if os.path.exists("/etc/secrets/cookies.txt"):
        import shutil
        shutil.copy("/etc/secrets/cookies.txt", "/tmp/cookies.txt")
        cookie_path = "/tmp/cookies.txt"

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "/tmp/temp_audio.%(ext)s",
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "wav",
            "preferredquality": "192"
        }],
        "cookiefile": cookie_path
    }

    print("Downloading audio...")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return output


# ----------------------------------
# Main ingestion pipeline
# ----------------------------------
def process_youtube(url, transcribe_audio_chunks):

    video_id = get_video_id(url)

    if video_id is None:
        raise ValueError("Invalid YouTube URL")

    print(f"Video ID: {video_id}")

    # ----------------------------------
    # 1️⃣ Check cache
    # ----------------------------------
    if transcript_exists(video_id):

        print("Transcript loaded from cache")

        return load_transcript(video_id)

    print("Checking YouTube captions...")

    # ----------------------------------
    # 2️⃣ Try captions
    # ----------------------------------
    captions = get_captions(video_id)

    if captions:

        print("Captions found — skipping Whisper")

        save_transcript(video_id, captions)

        return captions

    # ----------------------------------
    # 3️⃣ Fallback to Whisper
    # ----------------------------------
    print("No captions found — switching to Whisper transcription")

    audio_path = download_audio(url)

    print("Splitting audio into chunks...")

    from transcription import split_audio

    chunks_folder = split_audio(audio_path)

    print("Transcribing audio chunks...")

    transcript = transcribe_audio_chunks(chunks_folder)

    if not isinstance(transcript, list):
        raise ValueError("Transcription returned invalid format")

    print("Saving transcript to cache")

    save_transcript(video_id, transcript)

    return transcript