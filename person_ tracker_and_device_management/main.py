# main.py
from fastapi import FastAPI
from threading import Thread
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import requests

from utils.person_tracker import PersonTracker
from utils.S3_handler import S3Manager
from utils.audio_processor import AudioProcessor
from utils.voice_authorization import VoiceAutorization


load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # or ["*"] to allow all (not recommended in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# S3 credentials and configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
AWS_REGION = os.getenv('AWS_REGION')
S3_FOLDER = os.getenv('S3_FOLDER')

# Initialize classes
s3_manager = S3Manager(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION)
audio_processor = AudioProcessor()
audio_service = VoiceAutorization(s3_manager, audio_processor)

# Global reference to stop/start tracking if needed
tracker_instance = None

@app.post("/start-tracking")
def start_tracking():
    global tracker_instance

    video_source = "rtsp://admin:galamudune123@192.168.1.6:554/Streaming/Channels/201/"
    yolo_model_path = "models/yolo/weights/yolo11n.pt"
    deep_sort_model_path = 'deep_sort/deep/checkpoint/ckpt.t7'
    license_number = "123456"

    def run_tracker():
        tracker = PersonTracker(video_source, yolo_model_path, deep_sort_model_path, license_number)
        tracker.run()

    # Run in background thread so API can return immediately
    t = Thread(target=run_tracker)
    t.start()
    tracker_instance = t

    return {"status": "Tracking started."}


@app.get("/authorize_voice")
async def authorize_voice():
    return audio_service.download_and_process_audio(S3_FOLDER)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)