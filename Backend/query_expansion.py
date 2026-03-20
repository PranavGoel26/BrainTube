


import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_queries(question, num_queries=4):
    """
    Generate multiple search queries for better retrieval.
    Also correct spelling mistakes.
    """

    prompt = f"""
You are helping a search system retrieve lecture content.

Task:
1. Fix spelling mistakes in the question.
2. Generate {num_queries} short search queries that could match
   transcript text in a lecture.

Rules:
- Each query must be short (3–8 words).
- Do NOT include numbering.
- Do NOT include explanations.
- Only return the queries, one per line.

Question:
{question}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    text = response.choices[0].message.content

    queries = [
        q.strip().strip('"')
        for q in text.split("\n")
        if q.strip()
    ]

    # Ensure original corrected question appears first
    if queries:
        queries.insert(0, queries[0])
    else:
        queries = [question]

    return queries[:num_queries]