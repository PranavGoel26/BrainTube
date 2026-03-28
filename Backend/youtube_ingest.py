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
        # get_transcript prioritizes manual captions, then falls back to generated captions automatically.
        data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US'])
        print("English captions (manual or auto-generated) found successfully.")
        return [{"start": seg["start"], "end": seg["start"] + seg["duration"], "text": seg["text"]} for seg in data]
    except Exception as e:
        print(f"Caption retrieval failed for {video_id}: {e}")
        return None

# ----------------------------------
# Main ingestion pipeline
# ----------------------------------
def process_youtube(url):
    video_id = get_video_id(url)
    if video_id is None:
        raise ValueError("Invalid YouTube URL")

    print(f"Video ID: {video_id}")

    # 1. Check cache
    if transcript_exists(video_id):
        print("Transcript loaded from cache")
        return load_transcript(video_id)

    print("Checking YouTube captions...")

    # 2. Try captions
    captions = get_captions(video_id)
    if captions:
        print("Captions found — skipping Whisper")
        save_transcript(video_id, captions)
        return captions

    # 3. Fallback to Whisper is DISABLED for cost/performance.
    print("No captions found. Text-Only Mode active. Returning JSON error.")
    return {"error": "NO_CAPTIONS", "message": "This video does not have English transcripts available. Please try another video."}