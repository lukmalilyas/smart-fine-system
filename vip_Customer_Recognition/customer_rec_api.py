# filename: face_recognition_api.py
import face_recognition
import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import numpy as np
import os
import tempfile
import cv2

app = FastAPI()

# 🛡️ Enable CORS for your frontend (Vite runs at localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend origin here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load known faces
KNOWN_FACES_DIR = 'known_customers'
TOLERANCE = 0.5
MODEL = 'hog'

known_faces = []
known_names = []

for name in os.listdir(KNOWN_FACES_DIR):
    person_folder = os.path.join(KNOWN_FACES_DIR, name)
    if not os.path.isdir(person_folder):
        continue

    for filename in os.listdir(person_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(person_folder, filename)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_faces.append(encodings[0])
                known_names.append(name)
                print(f"[INFO] Loaded {filename} for {name}")
            else:
                print(f"[WARNING] No face found in {filename} for {name} — skipping.")

@app.post("/identify/")
async def identify_face(file: UploadFile = File(...)):
    contents = await file.read()

    # Save uploaded video temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(contents)
        temp_video_path = temp_video.name

    video = cv2.VideoCapture(temp_video_path)
    matches = []

    while True:
        ret, frame = video.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame, model=MODEL)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for face_encoding in face_encodings:
            results = face_recognition.compare_faces(known_faces, face_encoding, TOLERANCE)
            if True in results:
                match = known_names[results.index(True)]
                matches.append(match)
            else:
                matches.append("Unknown")

    video.release()
    os.remove(temp_video_path)

    return {"matches": matches}

# 🧠 Fix main condition typo
if __name__ == "__main__":
    uvicorn.run("customer_rec_api:app", host="0.0.0.0", port=8000, reload=False)