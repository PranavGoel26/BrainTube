# BrainTube

**Add a Brain to your YouTube Videos.**
Instant summaries, technical deep-dives, and interactive quizzes powered by RAG architecture.

BrainTube synthesizes educational video content into structured intelligence, transforming passive watching into active, high-retention learning.

## 🧠 Core Features

*   **Ingest:** Leverages high-fidelity transcript pipelines to extract audio and metadata at blazing speeds.
*   **Embed:** State-of-the-art embedding models chunk and vectorize the video content, building a localized FAISS intelligence matrix.
*   **Interact (RAG):** Chat directly with the video context. Generate quizzes, deep-dives, and summaries with complete resistance to hallucinations using Llama 3 on Groq.
*   **User Isolation:** Complete sandboxing using Clerk Authentication. Data, vector stores, and watch history are strictly tied to unique user accounts.
*   **Hardware-Accelerated UI:** The frontend runs on React + Framer Motion, utilizing buttery-smooth `useSpring` cursor tracking, React Three Fiber nodes, and glassmorphism styling.

## 🏗 Architecture Workflow
1. User provides a YouTube link.
2. Backend validates the metadata and dispatches the task.
3. Node.js fetches the transcript via Supadata or yt-dlp.
4. Python chunks the text and embeds it via HuggingFace models.
5. The FAISS vector database syncs remotely to GCS.
6. React polls the `fetchVideos` API and updates the staggered dashboard UI upon analysis completion.
7. Subsequent Chat/Quiz requests map strict nearest-neighbor lookups over the transcript to answer accurately.
