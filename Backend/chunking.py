import json

# ======================================
# Load transcript
# ======================================
def load_transcript(file_path: str):
    with open(file_path, "r") as f:
        return json.load(f)

# ======================================
# Merge transcript segments
# ======================================
def merge_segments(transcript: list):
    merged_text = " ".join([segment["text"] for segment in transcript])
    return {
        "text": merged_text.strip(),
        "start": transcript[0]["start"],
        "end": transcript[-1]["end"]
    }

# ======================================
# Chunk merged text
# ======================================
def chunk_text(text: str, start_time: float, end_time: float, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append({
            "text": text[start:end].strip(),
            "start": start_time,
            "end": end_time
        })
        start += chunk_size - overlap
    return chunks

# ======================================
# Create chunks directly from transcript
# ======================================
def create_chunks(transcript, chunk_size=800, chunk_overlap=200):
    # If transcript is a file path, load it
    if isinstance(transcript, str):
        with open(transcript, "r") as f:
            transcript = json.load(f)

    chunks = []
    for segment in transcript:
        text = segment["text"]
        start_time = segment["start"]
        end_time = segment["end"]
        start = 0

        while start < len(text):
            chunk_text = text[start:start + chunk_size]
            chunks.append({
                "text": chunk_text.strip(),
                "start": start_time,
                "end": end_time
            })
            start += chunk_size - chunk_overlap

    return chunks

# ======================================
# Save chunks
# ======================================
def save_chunks(chunks, output_file="chunks.json"):
    with open(output_file, "w") as f:
        json.dump(chunks, f, indent=4)
    print("Chunks saved:", output_file)