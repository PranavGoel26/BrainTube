import os
import re
import requests
from cache_utils import transcript_exists, load_transcript, save_transcript
from googleapiclient.discovery import build

def get_video_id(url):
    if "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return None

def parse_iso_duration(iso_str):
    if not iso_str.startswith("PT"): return "0:00"
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_str)
    if not match: return "0:00"
    h, m, s = int(match.group(1) or 0), int(match.group(2) or 0), int(match.group(3) or 0)
    return f"{h}:{m:02d}:{s:02d}" if h > 0 else f"{m}:{s:02d}"

def get_video_metadata(video_id):
    api_key = os.getenv("YOUTUBE_API_KEY")
    default_meta = {"title": "Unknown Title", "channel": "Unknown Channel", "duration": "0:00"}
    if not api_key: return default_meta
    try:
        youtube = build("youtube", "v3", developerKey=api_key)
        resp = youtube.videos().list(part="snippet,contentDetails", id=video_id).execute()
        if not resp.get("items"): return default_meta
        item = resp["items"][0]
        title = item["snippet"].get("title", "Unknown Title")
        channel = item["snippet"].get("channelTitle", "Unknown Channel")
        dur_str = parse_iso_duration(item["contentDetails"].get("duration", ""))
        return {"title": title, "channel": channel, "duration": dur_str}
    except Exception:
        return default_meta

def get_captions(url):
    api_key = os.getenv("SUPADATA_API_KEY")
    if not api_key:
        print("Warning: SUPADATA_API_KEY is missing.")
        return None
        
    try:
        resp = requests.get(f"https://api.supadata.ai/v1/transcript?url={url}", headers={"x-api-key": api_key}, timeout=15)
        if resp.status_code != 200:
            print(f"Supadata API Error {resp.status_code}: {resp.text}")
            return None
            
        content = resp.json().get("content", [])
        if not content: return None
            
        return [{
            "start": item.get("offset", 0) / 1000.0,
            "end": (item.get("offset", 0) + item.get("duration", 2000)) / 1000.0,
            "text": item.get("text", "")
        } for item in content]
    except Exception as e:
        print(f"Supadata retrieval failed: {e}")
        return None

def process_youtube(url):
    video_id = get_video_id(url)
    if not video_id: raise ValueError("Invalid YouTube URL")

    if transcript_exists(video_id):
        return load_transcript(video_id)

    captions = get_captions(url)
    if captions:
        save_transcript(video_id, captions)
        return captions

    return {"error": "NO_CAPTIONS", "message": "This video does not have transcripts available via Supadata."}