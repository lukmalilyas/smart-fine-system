# filename: face_recognition_api.py
import face_recognition
import uvicorn
from fastapi import FastAPI, UploadFile, File
from typing import List
import numpy as np
from PIL import Image
import io
import os

app = FastAPI()

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
            image = face_recognition.load_image_file(os.path.join(person_folder, filename))
            encoding = face_recognition.face_encodings(image)[0]
            known_faces.append(encoding)
            known_names.append(name)
            

@app.post("/identify/")
async def identify_face(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    rgb_image = np.array(image.convert('RGB'))

    face_locations = face_recognition.face_locations(rgb_image, model=MODEL)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

    matches = []
    for face_encoding in face_encodings:
        results = face_recognition.compare_faces(known_faces, face_encoding, TOLERANCE)
        if True in results:
            match = known_names[results.index(True)]
            matches.append(match)
        else:
            matches.append("Unknown")

    return {"matches": matches}

if __name__ == "__main__":
    uvicorn.run("customer_rec_api:app", host="0.0.0.0", port=8000)