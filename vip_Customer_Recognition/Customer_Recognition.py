import face_recognition
import cv2
import os
import numpy as np
from datetime import datetime

# === 1️⃣ Load Known Customer Faces ===
KNOWN_FACES_DIR = 'known_customers'
TOLERANCE = 0.6
FRAME_THICKNESS = 3
FONT_THICKNESS = 2
MODEL = 'hog'  # 'cnn' for GPU, 'hog' for CPU

print('Loading known faces...')
known_faces = []
known_names = []

for name in os.listdir(KNOWN_FACES_DIR):
    person_folder = os.path.join(KNOWN_FACES_DIR, name)
    if not os.path.isdir(person_folder):
        continue  # Skip files like .DS_Store
    
    for filename in os.listdir(person_folder):
        file_path = os.path.join(person_folder, filename)
        image = face_recognition.load_image_file(file_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_faces.append(encodings[0])
            known_names.append(name)

print(f"Loaded {len(known_faces)} known face encodings.")

# === 2️⃣ Start Camera Stream ===
print('Starting camera...')
video = cv2.VideoCapture(0)

while True:
    ret, image = video.read()
    if not ret:
        break

    # Resize for faster processing
    small_frame = cv2.resize(image, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    # Detect faces
    face_locations = face_recognition.face_locations(rgb_small_frame, model=MODEL)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    # Compare detected faces to known faces
    for face_encoding, face_location in zip(face_encodings, face_locations):
        results = face_recognition.compare_faces(known_faces, face_encoding, TOLERANCE)
        match = None

        if True in results:
            match = known_names[results.index(True)]
            top_left = (face_location[3] * 4, face_location[0] * 4)
            bottom_right = (face_location[1] * 4, face_location[2] * 4)

            cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), FRAME_THICKNESS)
            cv2.putText(image, f"Welcome {match}!", 
                        (top_left[0], top_left[1] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), FONT_THICKNESS)

            # Log visit
            with open("visit_log.txt", "a") as f:
                f.write(f"{datetime.now()} - {match} visited!\n")
            print(f"[INFO] {match} recognized and logged!")

        else:
            # Draw red box for unknown face
            top_left = (face_location[3] * 4, face_location[0] * 4)
            bottom_right = (face_location[1] * 4, face_location[2] * 4)

            cv2.rectangle(image, top_left, bottom_right, (0, 0, 255), FRAME_THICKNESS)
            cv2.putText(image, "Unknown", 
                        (top_left[0], top_left[1] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), FONT_THICKNESS)

    # Display the resulting frame
    cv2.imshow('Customer Recognition', image)

    # Exit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release everything
video.release()
cv2.destroyAllWindows()