from rank_bm25 import BM25Okapi


def build_bm25_index(chunks):

    corpus = [c["text"].split() for c in chunks]

    bm25 = BM25Okapi(corpus)

    return bm25

def keyword_search(query, bm25, chunks, top_k=3):

    tokenized_query = query.split()

    scores = bm25.get_scores(tokenized_query)

    ranked = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True
    )

    results = []

    for i in ranked[:top_k]:
        results.append(chunks[i])

    return results