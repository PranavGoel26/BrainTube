from chunking import create_chunks
from embeddings import build_vector_database

chunks = create_chunks("transcript.json")

index = build_vector_database(chunks)

print("Vector database built successfully")





# from embeddings import load_embedding_model

# model = load_embedding_model()

# embedding = model.encode("Machine")

# print(embedding)