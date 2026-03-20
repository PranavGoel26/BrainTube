from chunking import create_chunks, save_chunks

chunks = create_chunks("transcript.json")

save_chunks(chunks)

print("Total chunks:", len(chunks))
print(chunks[0])
