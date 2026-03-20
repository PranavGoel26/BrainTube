import os
import json
import faiss
import numpy as np
import torch
import hashlib
from sentence_transformers import SentenceTransformer

VECTOR_DIR = "vector_store"

def get_video_paths(video_id: str):
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    base_dir = f"{VECTOR_DIR}/{safe_name}"
    os.makedirs(base_dir, exist_ok=True)
    return f"{base_dir}/faiss_index.bin", f"{base_dir}/metadata.json"

def load_embedding_model():
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device=device)
    print("Embedding model loaded on:", device)
    return model

model = load_embedding_model()

def generate_embeddings(chunks):
    texts = [chunk["text"] for chunk in chunks]
    embeddings = model.encode(texts)
    return np.array(embeddings).astype("float32")

def load_or_create_index(dimension, video_id):
    index_path, meta_path = get_video_paths(video_id)
    if os.path.exists(index_path):
        print(f"Loading existing vector index for {video_id}...")
        index = faiss.read_index(index_path)
        with open(meta_path) as f:
            metadata = json.load(f)
    else:
        print(f"Creating new vector index for {video_id}...")
        index = faiss.IndexFlatL2(dimension)
        metadata = []
    return index, metadata

def save_vector_store(index, metadata, video_id):
    index_path, meta_path = get_video_paths(video_id)
    faiss.write_index(index, index_path)
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"Vector store updated for {video_id}")

def add_to_vector_database(chunks, video_id):
    if not chunks:
        return None
    embeddings = generate_embeddings(chunks)
    dimension = embeddings.shape[1]
    index, metadata = load_or_create_index(dimension, video_id)
    index.add(embeddings)
    metadata.extend(chunks)
    save_vector_store(index, metadata, video_id)
    return index

def delete_vector_store(video_id: str) -> bool:
    import shutil
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    base_dir = f"{VECTOR_DIR}/{safe_name}"
    if os.path.exists(base_dir):
        shutil.rmtree(base_dir)
        print(f"Deleted vector store for {video_id}")
        return True
    return False
