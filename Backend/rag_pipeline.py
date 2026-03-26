from retrieval import retrieve_context
from llm import build_prompt, generate_answer, rewrite_query

def ask_question(question, video_id, history=None):
    try:
        standalone_query = question
        if history and len(history) > 0:
            standalone_query = rewrite_query(question, history)
            
        chunks = retrieve_context(standalone_query, video_id)
        if not chunks or len(chunks) == 0:
            return {
                "status": "not_found",
                "message": "This topic is not discussed in the video. Check if the video is processed correctly."
            }
        prompt = build_prompt(question, chunks, history)
        answer = generate_answer(prompt)
        if answer.strip() == "NOT_FOUND":
            return {
                "status": "not_found",
                "message": "This topic is not discussed in the video. Do you want a general explanation?"
            }
        timestamps = []
        for c in chunks:
            if "start" in c and "end" in c:
                timestamps.append({"start": c["start"], "end": c["end"]})
        return {
            "status": "found",
            "answer": answer,
            "timestamps": timestamps,
            "chunks": chunks
        }
    except Exception:
        return {
            "status": "error",
            "message": "I'm sorry, I couldn't process this video's audio. Please try another video or check the logs for download errors."
        }