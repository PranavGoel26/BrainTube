from retrieval import retrieve_context

query = "What is fine tunning?"

results = retrieve_context(query)

for r in results:
    print("\nTEXT:", r["text"])
    print("START:", r["start"])
    print("END:", r["end"])