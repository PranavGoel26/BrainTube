# from retrieval import vector_search
# from keyword_search import keyword_search, build_bm25_index
# from embeddings import load_embedding_model
# import json


# # load chunks
# with open("chunks_metadata.json") as f:
#     chunks = json.load(f)

# # build keyword index
# bm25 = build_bm25_index(chunks)

# query = "What is fine tuning?"

# print("\nVECTOR SEARCH RESULTS:\n")

# vector_results = vector_search(query)

# for r in vector_results:
#     print(r["text"][:120])
#     print(r["start"], "→", r["end"])
#     print()

# print("\nKEYWORD SEARCH RESULTS:\n")

# keyword_results = keyword_search(query, bm25, chunks)

# for r in keyword_results:
#     print(r["text"][:120])
#     print(r["start"], "→", r["end"])
#     print()

# print("\nHYBRID RESULTS:\n")

# combined = vector_results + keyword_results

# # remove duplicates
# seen = set()
# unique = []

# for r in combined:

#     text = r["text"]

#     if text not in seen:
#         unique.append(r)
#         seen.add(text)

# for r in unique[:3]:

#     print(r["text"][:120])
#     print(r["start"], "→", r["end"])
#     print()

from retrieval import hybrid_search

query = "What is parameter efficient fine tuning?"

results = hybrid_search(query)

for r in results:
    print(r["text"][:120])
    print(r["start"], "→", r["end"])
    print()