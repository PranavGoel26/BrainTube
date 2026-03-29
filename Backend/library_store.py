import json
import os
from typing import List, Dict, Any
from gcs_utils import download_from_gcs, upload_to_gcs

def get_library_paths(user_id: str):
    return f"/tmp/data/{user_id}_library.json", f"users/{user_id}/library.json"

def init_library(user_id: str) -> None:
    os.makedirs("/tmp/data", exist_ok=True)
    local_file, gcs_blob = get_library_paths(user_id)
    if not os.path.exists(local_file):
        success = download_from_gcs(gcs_blob, local_file)
        if not success:
            with open(local_file, "w", encoding="utf-8") as f:
                json.dump([], f)

def get_library(user_id: str) -> List[Dict[str, Any]]:
    init_library(user_id)
    local_file, _ = get_library_paths(user_id)
    with open(local_file, "r", encoding="utf-8") as f:
        return json.load(f)

def add_to_library(video_data: Dict[str, Any], user_id: str) -> None:
    lib = get_library(user_id)
    video_data["user_id"] = user_id
    # Update if already exists, else append
    for idx, v in enumerate(lib):
        if v.get("url") == video_data.get("url"):
            lib[idx] = video_data
            break
    else:
        lib.append(video_data)
        
    local_file, gcs_blob = get_library_paths(user_id)
    with open(local_file, "w", encoding="utf-8") as f:
        json.dump(lib, f, indent=2)
    upload_to_gcs(local_file, gcs_blob)

def remove_from_library(video_url: str, user_id: str) -> bool:
    lib = get_library(user_id)
    new_lib = [v for v in lib if v.get("url") != video_url]
    if len(new_lib) == len(lib):
        return False  # Not found
    local_file, gcs_blob = get_library_paths(user_id)
    with open(local_file, "w", encoding="utf-8") as f:
        json.dump(new_lib, f, indent=2)
    upload_to_gcs(local_file, gcs_blob)
    return True
