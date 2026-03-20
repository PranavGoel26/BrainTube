from youtube_ingest import process_youtube
from transcription import transcribe_audio_chunks
from chunking import create_chunks
from embeddings import add_to_vector_database
from rag_pipeline import ask_question
from llm import generate_general_explanation


# -----------------------------
# Step 1 — ingest YouTube video
# -----------------------------
url = input("Paste YouTube URL: ")

print("\nProcessing YouTube video...\n")

transcript = process_youtube(url, transcribe_audio_chunks)


# -----------------------------
# Step 2 — chunk transcript
# -----------------------------
chunks = create_chunks(transcript)

print("Chunks created:", len(chunks))


# -----------------------------
# Step 3 — store embeddings
# -----------------------------
add_to_vector_database(chunks)

print("Video added to vector database.\n")


# -----------------------------
# Step 4 — ask question
# -----------------------------
question = input("Ask a question about the video: ")

result = ask_question(question)


if result["status"] == "not_found":

    print("\n", result["message"])

    choice = input("Type YES if you want explanation: ")

    if choice.lower() == "yes":

        explanation = generate_general_explanation(question)

        print("\nExplanation:\n")
        print(explanation)

else:

    print("\nANSWER:\n")
    print(result["answer"])

    print("\nRelevant timestamps:\n")

    for c in result["chunks"]:
        print(c["start"], "→", c["end"])