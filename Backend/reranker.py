print("Reranker loaded (Bypassed for Cloud Run memory optimization).")

def rerank(query, chunks, top_k=3):
    """
    Reranker is bypassed to avoid loading torch and the heavy ms-marco CrossEncoder.
    We assume the BM25 + Vector Hybrid search gives sufficiently good results.
    """
    return chunks[:top_k]