from transcription import process_video
from chunking import chunk_text
from embeddings import embed_chunks, save_embeddings


def ingest_video(video_path):

    transcript = process_video(video_path)

    chunks = chunk_text(transcript)

    embeddings = embed_chunks(chunks)

    save_embeddings(embeddings, chunks)

    print("Video added to knowledge base")