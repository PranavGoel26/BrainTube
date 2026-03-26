import faiss
import json
import os
import numpy as np
import hashlib
from keyword_search import build_bm25_index, keyword_search
from reranker import rerank
from query_expansion import generate_queries
from gcs_utils import download_from_gcs

VECTOR_DIR = "/tmp/vector_store"

def get_video_paths(video_id: str):
    safe_name = hashlib.md5(video_id.encode()).hexdigest()
    base_dir = f"{VECTOR_DIR}/{safe_name}"
    return f"{base_dir}/faiss_index.bin", f"{base_dir}/metadata.json"

def get_index_and_metadata(video_id):
    index_path, meta_path = get_video_paths(video_id)
    
    # Try downloading from GCS first if missing locally
    if not os.path.exists(index_path) or not os.path.exists(meta_path):
        import hashlib
        safe_name = hashlib.md5(video_id.encode()).hexdigest()
        download_from_gcs(f"vector_store/{safe_name}/faiss_index.bin", index_path)
        download_from_gcs(f"vector_store/{safe_name}/metadata.json", meta_path)

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
    from embeddings import get_model
    embeddings_generator = get_model().embed([query])
    query_embedding = list(embeddings_generator)[0]
    return np.array([query_embedding]).astype("float32")

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