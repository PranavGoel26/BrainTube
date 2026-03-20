import json



def load_transcript(path="transcript.json"):

    with open(path, "r") as f:
        data = json.load(f)

    texts = []

    for segment in data:
        texts.append(segment["text"])

    return texts

def chunk_transcript(texts, chunk_size=10):

    chunks = []

    for i in range(0, len(texts), chunk_size):

        chunk = " ".join(texts[i:i+chunk_size])

        chunks.append(chunk)

    return chunks

from llm import generate_answer


def summarize_chunks(chunks):

    summaries = []

    for chunk in chunks:

        prompt = f"""
Summarize this lecture section in bullet points.

Text:
{chunk}
"""

        summary = generate_answer(prompt)

        summaries.append(summary)

    return summaries

def combine_summaries(summaries):

    combined = "\n".join(summaries)

    prompt = f"""
Create a final structured summary from these lecture summaries.

Summaries:
{combined}

Provide:
• Key concepts
• Important ideas
• Final bullet points
"""

    final_summary = generate_answer(prompt)

    return final_summary


def generate_full_summary():

    texts = load_transcript()

    chunks = chunk_transcript(texts)

    summaries = summarize_chunks(chunks)

    final_summary = combine_summaries(summaries)

    return final_summary