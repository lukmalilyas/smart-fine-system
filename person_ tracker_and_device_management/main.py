# main.py
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import requests

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

@app.get("/authorize_voice")
async def authorize_voice():
    return audio_service.download_and_process_audio(S3_FOLDER)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)