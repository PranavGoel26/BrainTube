import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# =====================================
# Rewrite context query based on memory
# =====================================
def rewrite_query(question, history):
    if not history or len(history) == 0:
        return question
        
    history_text = ""
    for msg in history[-4:]:
        role = "Student" if msg.get("role") == "user" else "Tutor"
        history_text += f"{role}: {msg.get('text')}\n"
        
    prompt = f"""
Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone search query that can be used to search a database.
Do NOT answer the question, just reformulate it. If the question is already standalone, return it as is.

Conversation History:
{history_text}

Follow-up Question: {question}

Standalone Query:"""
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return response.choices[0].message.content.strip()


# =====================================
# Build prompt for RAG answer
# =====================================
def build_prompt(question, chunks, history=None):
    # limit context size to avoid long prompts
    chunks = chunks[:5]

    if len(chunks) == 0:
        context = "EMPTY_CONTEXT"
    else:
        context = ""
        for c in chunks:
            context += c["text"] + "\n"

    history_text = ""
    if history:
        for msg in history[-4:]:
            role = "Student" if msg.get("role") == "user" else "Tutor"
            history_text += f"{role}: {msg.get('text')}\n"

    prompt = f"""
You are an AI tutor answering student questions using lecture transcripts.

Transcript Context:
{context}

Previous Conversation Context:
{"None" if not history_text else history_text}

Student Question:
{question}

Instructions:
1. Read the transcript context and previous conversation carefully.
2. If the answer is clearly present in the transcript context, explain the idea in your own words.
3. If the user refers to previous context (like "what did you mean?" or "who is he?"), answer them naturally based on the history and the transcript.
4. Do NOT copy sentences directly from the transcript.
5. If the transcript does NOT contain the answer, and it cannot be logically inferred from the previous conversation, respond exactly with:

NOT_FOUND

Important Rules:
- Do NOT generate timestamps.
- Do NOT mention the transcript in your answer.
- Do NOT invent facts.
- Return ONLY the answer or NOT_FOUND.
"""
    return prompt


# =====================================
# Generate answer from transcript
# =====================================
def generate_answer(prompt):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You answer questions strictly using provided transcript context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )
    return response.choices[0].message.content.strip()


# =====================================
# Generate explanation when user asks
# =====================================
def generate_general_explanation(question):
    prompt = f"""
Explain the following concept clearly for a student.

Question:
{question}

Rules:
- Simple explanation
- No timestamps
- No references to any video or transcript
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful teacher explaining concepts simply. The response MUST be in English. Do not use any other language."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()

# =====================================
# Generate dynamic quiz
# =====================================
def generate_quiz_from_llm(num_questions, transcript_sample):
    prompt = f"""
Generate a multiple-choice quiz based on the following transcript.
You MUST generate exactly {num_questions} questions.
Format the output EXACTLY as a valid raw JSON array of objects, with NO Markdown wrapping or additional text.
Example Format:
[
  {{ "question": "Sample?", "options": ["A", "B", "C", "D"], "correct": 0 }}
]
The 'correct' field must be the integer index of the correct option (0-3).

Transcript: 
{transcript_sample}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a quiz generation engine that strictly returns valid JSON arrays. The response MUST be in English. Do not use any other language."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7 # varied for retry
    )
    return response.choices[0].message.content.strip()