import json
import os
from typing import List, Dict, Any

LIBRARY_FILE = "data/library.json"

def init_library() -> None:
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(LIBRARY_FILE):
        with open(LIBRARY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

def get_library() -> List[Dict[str, Any]]:
    init_library()
    with open(LIBRARY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def add_to_library(video_data: Dict[str, Any]) -> None:
    lib = get_library()
    # Update if already exists, else append
    for idx, v in enumerate(lib):
        if v.get("url") == video_data.get("url"):
            lib[idx] = video_data
            break
    else:
        lib.append(video_data)
        
    with open(LIBRARY_FILE, "w", encoding="utf-8") as f:
        json.dump(lib, f, indent=2)

def remove_from_library(video_url: str) -> bool:
    lib = get_library()
    new_lib = [v for v in lib if v.get("url") != video_url]
    if len(new_lib) == len(lib):
        return False  # Not found
    with open(LIBRARY_FILE, "w", encoding="utf-8") as f:
        json.dump(new_lib, f, indent=2)
    return True
