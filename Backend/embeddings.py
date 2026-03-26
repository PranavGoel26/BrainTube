import os
import json
import faiss
import numpy as np
import hashlib
from fastembed import TextEmbedding
from gcs_utils import download_from_gcs, upload_to_gcs, delete_from_gcs

VECTOR_DIR = "/tmp/vector_store"

def get_video_paths(video_id: str):
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    base_dir = f"{VECTOR_DIR}/{safe_name}"
    os.makedirs(base_dir, exist_ok=True)
    return f"{base_dir}/faiss_index.bin", f"{base_dir}/metadata.json"

def load_embedding_model():
    model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    print("Embedding model loaded via fastembed (CPU ONNX)")
    return model

model = None

def get_model():
    global model
    if model is None:
        model = load_embedding_model()
    return model

def generate_embeddings(chunks):
    texts = [chunk["text"] for chunk in chunks]
    embeddings_generator = get_model().embed(texts, batch_size=32)
    embeddings = list(embeddings_generator)
    return np.array(embeddings).astype("float32")

def load_or_create_index(dimension, video_id):
    index_path, meta_path = get_video_paths(video_id)
    
    # Try downloading from GCS first
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    download_from_gcs(f"vector_store/{safe_name}/faiss_index.bin", index_path)
    download_from_gcs(f"vector_store/{safe_name}/metadata.json", meta_path)

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
        
    # Sync back to GCS
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    upload_to_gcs(index_path, f"vector_store/{safe_name}/faiss_index.bin")
    upload_to_gcs(meta_path, f"vector_store/{safe_name}/metadata.json")
    print(f"Vector store updated for {video_id} and synced to GCS")

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
    
    # Delete from GCS
    delete_from_gcs(f"vector_store/{safe_name}/faiss_index.bin")
    delete_from_gcs(f"vector_store/{safe_name}/metadata.json")

    if os.path.exists(base_dir):
        shutil.rmtree(base_dir)
        print(f"Deleted local vector store for {video_id}")
        return True
    return False
