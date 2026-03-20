import faiss
import json
import numpy as np
import torch
import hashlib
from sentence_transformers import SentenceTransformer
from keyword_search import build_bm25_index, keyword_search
from reranker import rerank
from query_expansion import generate_queries

VECTOR_DIR = "vector_store"

def get_video_paths(video_id: str):
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    base_dir = f"{VECTOR_DIR}/{safe_name}"
    return f"{base_dir}/faiss_index.bin", f"{base_dir}/metadata.json"

print("Loading embedding model...")
device = "mps" if torch.backends.mps.is_available() else "cpu"
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device=device)
print("Embedding model running on:", device)

def get_index_and_metadata(video_id):
    index_path, meta_path = get_video_paths(video_id)
    try:
        index = faiss.read_index(index_path)
        with open(meta_path, "r") as f:
            chunks = json.load(f)
        bm25 = build_bm25_index(chunks)
        return index, chunks, bm25
    except Exception as e:
        print(f"Could not load index for {video_id}: {e}")
        return None, None, None

def embed_query(query):
    query_embedding = model.encode([query])
    return np.array(query_embedding).astype("float32")

def vector_search(query, index, chunks, top_k=5):
    query_embedding = embed_query(query)
    distances, indices = index.search(query_embedding, top_k)
    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx < len(chunks):
            chunk = chunks[idx].copy()
            chunk["score"] = float(dist)
            results.append(chunk)
    return results

def hybrid_search(query, index, chunks, bm25, top_k=5):
    if not index or not chunks: return []
    vector_results = vector_search(query, index, chunks, top_k)
    keyword_results = keyword_search(query, bm25, chunks, top_k)
    combined = vector_results + keyword_results
    seen = set()
    unique = []
    for r in combined:
        text = r["text"]
        if text not in seen:
            unique.append(r)
            seen.add(text)
    return unique

def multi_query_retrieval(question, index, chunks, bm25, top_k=5):
    queries = generate_queries(question, num_queries=4)
    print("Expanded queries:", queries)
    all_results = []
    for q in queries:
        results = hybrid_search(q, index, chunks, bm25, top_k)
        all_results.extend(results)
    seen = set()
    unique = []
    for r in all_results:
        text = r["text"]
        if text not in seen:
            unique.append(r)
            seen.add(text)
    return unique

def retrieve_context(query, video_id, threshold=1.2, top_k=5):
    index, chunks, bm25 = get_index_and_metadata(video_id)
    if not index:
        return []
    results = multi_query_retrieval(query, index, chunks, bm25, top_k)
    if not results:
        return []
    results = rerank(query, results, top_k=3)
    filtered = []
    for r in results:
        if "score" in r:
            if r["score"] < threshold:
                filtered.append(r)
        else:
            filtered.append(r)
    return filtered