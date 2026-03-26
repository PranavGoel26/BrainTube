import os
import json

CACHE_DIR = "/tmp/cache/transcripts"


def get_cache_path(video_id):
    return os.path.join(CACHE_DIR, f"{video_id}.json")


def transcript_exists(video_id):
    return os.path.exists(get_cache_path(video_id))


def load_transcript(video_id):

    with open(get_cache_path(video_id), "r") as f:
        return json.load(f)


def save_transcript(video_id, transcript):

    os.makedirs(CACHE_DIR, exist_ok=True)

    with open(get_cache_path(video_id), "w") as f:
        json.dump(transcript, f, indent=4)