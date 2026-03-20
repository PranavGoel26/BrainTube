from sentence_transformers import CrossEncoder

print("Loading reranker model...")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")


def rerank(query, chunks, top_k=3):

    pairs = []

    for c in chunks:
        pairs.append((query, c["text"]))

    scores = reranker.predict(pairs)

    ranked = sorted(
        zip(chunks, scores),
        key=lambda x: x[1],
        reverse=True
    )

    results = []

    for chunk, score in ranked[:top_k]:

        chunk["rerank_score"] = float(score)
        results.append(chunk)

    return results