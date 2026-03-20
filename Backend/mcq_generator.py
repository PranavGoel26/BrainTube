import json
from llm import generate_answer


# -----------------------------
# Load transcript
# -----------------------------
def load_transcript(path="transcript.json"):

    with open(path, "r") as f:
        data = json.load(f)

    text = ""

    for seg in data:
        text += seg["text"] + " "

    return text


# -----------------------------
# Build MCQ prompt
# -----------------------------
def build_mcq_prompt(context, num_questions=5):

    prompt = f"""
You are an AI tutor.

Generate {num_questions} multiple choice questions from the lecture below.

Rules:
- Each question must have 4 options (A, B, C, D)
- Provide the correct answer
- Questions should test conceptual understanding

Lecture:
{context}

Format:

Q1. Question text

A) option  
B) option  
C) option  
D) option  

Answer: X
"""

    return prompt


# -----------------------------
# Generate MCQ
# -----------------------------
def generate_mcq(context):

    prompt = build_mcq_prompt(context)

    mcqs = generate_answer(prompt)

    return mcqs