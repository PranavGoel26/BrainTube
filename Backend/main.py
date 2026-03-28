from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import json
import re

from youtube_ingest import process_youtube, get_video_id, get_video_metadata
from chunking import create_chunks
from embeddings import add_to_vector_database
from rag_pipeline import ask_question
from llm import generate_general_explanation, generate_quiz_from_llm
from library_store import add_to_library, get_library, remove_from_library
from retrieval import get_index_and_metadata
from embeddings import add_to_vector_database, delete_vector_store

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    #allow_origins=["*"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event('startup')
async def startup_event():
    import shutil
    print(f'Node Path: {shutil.which("node")}')

class VideoRequest(BaseModel):
    url: str

@app.get("/")
async def root_health_check():
    return {"status": "ok"}

class ChatRequest(BaseModel):
    query: str
    video_url: Optional[str] = None
    history: Optional[list] = None

class QuizRequest(BaseModel):
    video_url: str

def background_process_video(url, title, channel, duration_str):
    try:
        transcript = process_youtube(url)
        
        if isinstance(transcript, dict) and transcript.get("error") == "NO_CAPTIONS":
            add_to_library({
                "id": url,
                "url": url,
                "title": title,
                "channel": channel,
                "duration": duration_str,
                "analyzed": True,
                "summary": transcript.get("message", "Video transcript unavailable."),
                "thumbnail": "from-primary/30 to-accent/10"
            })
            return
            
        chunks = create_chunks(transcript)
        add_to_vector_database(chunks, url)
        
        # Scaled Summary Generation
        transcript_text = " ".join([seg.get("text", "") for seg in transcript])[:15000]
        summary_query = f"Provide a detailed summary of this video transcript. The summary MUST be exactly 2 concise paragraphs. Do not use bullet points or numbered lists. Do not expand it unnecessarily. Do not use timestamps or reference the transcript directly. Transcript: {transcript_text}"
        summary_text = generate_general_explanation(summary_query)
        
        # Save to library as completed
        add_to_library({
            "id": url,
            "url": url,
            "title": title,
            "channel": channel,
            "duration": duration_str,
            "analyzed": True,
            "summary": summary_text,
            "thumbnail": "from-primary/30 to-accent/10"
        })
    except Exception as e:
        print(f"Background processing failed for {url}: {e}")


@app.post("/api/process_video")
async def process_video(request: VideoRequest, background_tasks: BackgroundTasks):
    try:
        try:
            video_id = get_video_id(request.url)
            if video_id:
                meta = get_video_metadata(video_id)
                title = meta["title"]
                channel = meta["channel"]
                duration_str = meta["duration"]
            else:
                title = "Unknown Title"
                channel = "Unknown Channel"
                duration_str = "0:00"
        except Exception:
            title = "Unknown Title"
            channel = "Unknown Channel"
            duration_str = "0:00"

        # Add to library as 'Processing' immediately
        add_to_library({
            "id": request.url,
            "url": request.url,
            "title": title,
            "channel": channel,
            "duration": duration_str,
            "analyzed": False,
            "summary": "This video is currently being analyzed by BrainTube. It usually takes less than 30 seconds. Please refresh the page in a moment.",
            "thumbnail": "from-primary/30 to-accent/10"
        })

        # Process in background
        background_tasks.add_task(background_process_video, request.url, title, channel, duration_str)
        
        return {"status": "success", "message": "Video analysis started in the background.", "url": request.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/videos")
async def get_videos():
    try:
        return get_library()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DeleteVideoRequest(BaseModel):
    video_url: str

@app.post("/api/delete_video")
async def delete_video(request: DeleteVideoRequest):
    try:
        removed = remove_from_library(request.video_url)
        deleted = delete_vector_store(request.video_url)
        if not removed:
            raise HTTPException(status_code=404, detail="Video not found in library.")
        return {"status": "success", "library_removed": removed, "vectors_deleted": deleted}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        if not request.video_url:
            raise ValueError("video_url is required for ask_question")
        result = ask_question(request.query, request.video_url, request.history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/general_explanation")
async def explanation(request: ChatRequest):
    try:
        ans = generate_general_explanation(request.query)
        return {"answer": ans}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz")
async def generate_quiz(request: QuizRequest):
    try:
        try:
            index, chunks, bm25 = get_index_and_metadata(request.video_url)
        except Exception:
            return {"error": "I'm sorry, I couldn't process this video's audio. Please try another video or check the logs for download errors."}

        if not chunks:
             return {"error": "I'm sorry, I couldn't process this video's audio. Please try another video or check the logs for download errors."}
            
        lib = get_library()
            
        num_questions = min(10, max(5, len(chunks) // 2))
        transcript_sample = " ".join([c["text"] for c in chunks])[:15000]
        
        response = generate_quiz_from_llm(num_questions, transcript_sample)
        
        # Parse JSON array safely
        match = re.search(r'\[.*\]', response, re.DOTALL)
        if match:
            try:
                quiz_data = json.loads(match.group(0))
                return {"questions": quiz_data}
            except json.JSONDecodeError:
                raise ValueError("The AI generated an incomplete response for the quiz. Please try again.")
        else:
            raise ValueError("Failed to parse LLM response into JSON.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import subprocess
    try:
        print("Node version Check:", subprocess.getoutput('node -v'))
    except Exception:
        pass
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
