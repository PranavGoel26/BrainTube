# from transcription import process_video
# from chunking import chunk_text
# from embeddings import add_to_vector_database

# video_path = "../data/videos/sample.mp4"

# print("Processing video...")

# transcript = process_video(video_path)

# chunks = chunk_text(transcript)

# add_to_vector_database(chunks)

# print("Video successfully added to knowledge base")


# from transcription import process_video
# from chunking import chunk_text
# from embeddings import add_to_vector_database

# video_path = "data/videos/sample.mp4"

# print("Processing video...")

# transcript = process_video(video_path)

# chunks = chunk_text(transcript)

# add_to_vector_database(chunks)

# print("Video successfully added to knowledge base")


from transcription import process_video
from chunking import create_chunks
from embeddings import add_to_vector_database

video_path = "../data/videos/sample.mp4"

print("Processing video...")

transcript = process_video(video_path)

chunks = create_chunks(transcript)

add_to_vector_database(chunks)

print("Video successfully added to knowledge base")