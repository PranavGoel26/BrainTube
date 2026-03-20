from youtube_ingest import process_youtube
from transcription import transcribe_audio

url = "https://www.youtube.com/watch?v=LPZh9BOjkQs"

transcript = process_youtube(url, transcribe_audio)

print("\nTranscript sample:\n")
print(transcript[:2])