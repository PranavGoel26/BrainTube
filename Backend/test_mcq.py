from mcq_generator import load_transcript, generate_mcq

transcript = load_transcript()

mcqs = generate_mcq(transcript)

print("\nGENERATED QUIZ:\n")
print(mcqs)