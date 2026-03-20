from transcription import process_video

video_path = "../data/videos/sample.mp4"

transcript = process_video(video_path)

print(transcript[:1000])

