import os
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter
from cache_utils import transcript_exists, load_transcript, save_transcript
from googleapiclient.discovery import build
import re

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
# Metadata via Official API
# ----------------------------------
def parse_iso_duration(iso_str):
    if not iso_str.startswith("PT"):
        return "0:00"
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_str)
    if not match:
        return "0:00"
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"

def get_video_metadata(video_id):
    api_key = os.getenv("YOUTUBE_API_KEY")
    default_meta = {"title": "Unknown Title", "channel": "Unknown Channel", "duration": "0:00"}
    if not api_key:
        print("Warning: YOUTUBE_API_KEY is not set. Cannot fetch metadata.")
        return default_meta
    
    try:
        youtube = build("youtube", "v3", developerKey=api_key)
        request = youtube.videos().list(part="snippet,contentDetails", id=video_id)
        response = request.execute()
        
        if not response.get("items"):
            return default_meta
            
        item = response["items"][0]
        title = item["snippet"].get("title", "Unknown Title")
        channel = item["snippet"].get("channelTitle", "Unknown Channel")
        
        duration_iso = item["contentDetails"].get("duration", "")
        duration_str = parse_iso_duration(duration_iso)
        
        return {"title": title, "channel": channel, "duration": duration_str}
    except Exception as e:
        print(f"YouTube Official API Metadata failed: {e}")
        return default_meta

# ----------------------------------
# Fetch captions from YouTube
# ----------------------------------
def get_captions(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, cookies='Backend/cookies.txt')
        
        # 1. Try to find any MANUAL english transcript first
        for transcript in transcript_list:
            if not transcript.is_generated and transcript.language_code.startswith('en'):
                print(f"Manual {transcript.language_code} captions found.")
                data = transcript.fetch()
                return [{"start": seg["start"], "end": seg["start"] + seg["duration"], "text": seg["text"]} for seg in data]

        # 2. Fallback to any GENERATED english transcript
        for transcript in transcript_list:
            if transcript.is_generated and transcript.language_code.startswith('en'):
                print(f"Auto-generated {transcript.language_code} captions found.")
                data = transcript.fetch()
                return [{"start": seg["start"], "end": seg["start"] + seg["duration"], "text": seg["text"]} for seg in data]
        
        print("No English transcript (manual or generated) could be matched.")
        return None
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