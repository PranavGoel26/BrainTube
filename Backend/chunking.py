# import json

# def load_transcript(file_path):

#     with open(file_path, "r") as f:
#         print(f)
#         transcript = json.load(f)

#     return transcript



# def merge_segments(transcript):

#     merged_text = ""
#     start_time = transcript[0]["start"]
#     end_time = transcript[-1]["end"]

#     # print(start_time)
#     # print(end_time)

#     for segment in transcript:
#         merged_text += " " + segment["text"]

#     # print(merged_text)

#     return {
#         "text": merged_text.strip(),
#         "start": start_time,
#         "end": end_time
#     }

# # result = merge_segments(load_transcript("transcript.json"))
# # print(result)


# def chunk_text(text, start_time, end_time, chunk_size=500, overlap=100):

#     chunks = []

#     start = 0
#     text_length = len(text)

#     while start < text_length:

#         end = start + chunk_size
#         chunk = text[start:end]

#         chunks.append({
#             "text": chunk,
#             "start": start_time,
#             "end": end_time
#         })

#         start += chunk_size - overlap

#     return chunks

# def create_chunks(transcript_file, chunk_size=300):

#     import json

#     with open(transcript_file, "r") as f:
#         transcript = json.load(f)

#     chunks = []

#     for segment in transcript:

#         text = segment["text"]
#         start = segment["start"]
#         end = segment["end"]

#         # split long text
#         for i in range(0, len(text), chunk_size):

#             chunk_text = text[i:i+chunk_size]

#             chunks.append({
#                 "text": chunk_text,
#                 "start": start,
#                 "end": end
#             })

#     return chunks


# def save_chunks(chunks, output_file="chunks.json"):

#     with open(output_file, "w") as f:
#         json.dump(chunks, f, indent=4)

#     print("Chunks saved")






import json


# ======================================
# Load transcript
# ======================================
def load_transcript(file_path):

    with open(file_path, "r") as f:
        transcript = json.load(f)

    return transcript


# ======================================
# Merge transcript segments
# ======================================
def merge_segments(transcript):

    merged_text = ""
    start_time = transcript[0]["start"]
    end_time = transcript[-1]["end"]

    for segment in transcript:
        merged_text += " " + segment["text"]

    return {
        "text": merged_text.strip(),
        "start": start_time,
        "end": end_time
    }


# ======================================
# Chunk merged text
# ======================================
def chunk_text(text, start_time, end_time, chunk_size=500, overlap=100):

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = start + chunk_size
        chunk = text[start:end]

        chunks.append({
            "text": chunk.strip(),
            "start": start_time,
            "end": end_time
        })

        start += chunk_size - overlap

    return chunks


# ======================================
# Create chunks directly from transcript
# ======================================
# def create_chunks(transcript, chunk_size=500):

#     chunks = []

#     for segment in transcript:

#         text = segment["text"]
#         start_time = segment["start"]
#         end_time = segment["end"]

#         start = 0
#         text_length = len(text)

#         while start < text_length:

#             end = start + chunk_size
#             chunk = text[start:end]

#             chunks.append({
#                 "text": chunk.strip(),
#                 "start": start_time,
#                 "end": end_time
#             })

#             start += chunk_size

#     return chunks


# def create_chunks(transcript, chunk_size=500):

#     chunks = []

#     for segment in transcript:

#         text = segment["text"]
#         start_time = segment["start"]
#         end_time = segment["end"]

#         start = 0

#         while start < len(text):

#             chunk_text = text[start:start + chunk_size]

#             chunks.append({
#                 "text": chunk_text.strip(),
#                 "start": start_time,
#                 "end": end_time
#             })

#             start += chunk_size

#     return chunks

def create_chunks(transcript, chunk_size=500):

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

            start += chunk_size

    return chunks


# ======================================
# Save chunks
# ======================================
def save_chunks(chunks, output_file="chunks.json"):

    with open(output_file, "w") as f:
        json.dump(chunks, f, indent=4)

    print("Chunks saved:", output_file)