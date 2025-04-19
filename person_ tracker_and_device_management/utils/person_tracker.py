import cv2
import torch
import numpy as np
import time
import os
from datetime import datetime

from ultralytics import YOLO
from dotenv import load_dotenv
from loguru import logger

from deep_sort.deep_sort import DeepSort
from db.database import DatabaseHandler
from api_clients.gemini_client import GeminiClient

class PersonTracker:
    def __init__(self, video_source, yolo_model_path, deep_sort_model_path, license_number, output_folder="detected_people"):
        # Load environment variables from the .env file
        load_dotenv()
        
        # Initialize variables
        self.model = YOLO(yolo_model_path)
        self.tracker = DeepSort(model_path=deep_sort_model_path, max_age=70)
        self.database_handler = DatabaseHandler()
        self.license_number = license_number
        self.gemini_client = GeminiClient()

        self.cap = cv2.VideoCapture(video_source)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.unique_ids = set()
        self.fps, self.counter = 0, 0
        self.start_time = time.perf_counter()

        self.output_folder = output_folder
        os.makedirs(self.output_folder, exist_ok=True)

    def save_person_image(self, track_id, person_img):
        """ Function to save person image and analyze it """
        person_filename = os.path.join(self.output_folder, f"person_{track_id}.jpg")
        cv2.imwrite(person_filename, person_img)
        logger.info(f"✅ Saved person {track_id} as image")

        # Analyze with Gemini in a background thread
        response = self.gemini_client.analyze_image(person_filename)
        return response

    def insert_to_database(self, track_id, person_appearance):
        """ Function to insert track ID into database asynchronously """
        now = datetime.now().date()
        query = """
        SELECT 1 FROM "Domain"."SurveillanceCount"
        WHERE "LicenseNumber" = %s AND "TrackID" = %s AND "Date" = %s
        LIMIT 1;
        """
        parameters = (self.license_number, track_id, now)
        cursor = self.database_handler.execute_query(query, parameters)
        rows = self.database_handler.fetch_all_rows(cursor)
        logger.info(person_appearance)
        if not rows:
            # If not exists, insert
            now = datetime.now()
            query = """
            INSERT INTO "Domain"."SurveillanceCount" ("LicenseNumber", "Date", "Time", "TrackID", "PersonAppearance")
            VALUES (%s, %s, %s, %s, %s)
            """
            parameters = (self.license_number, now.date(), now.time(), track_id, person_appearance)
            logger.info(f"✅ Track ID {track_id} inserted to database.")
            self.database_handler.execute_query(query, parameters)

    def process_frame(self, frame):
        """ Function to process each frame and perform tracking """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.model(rgb_frame, device=0, classes=[0], conf=0.5)

        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            xywh = boxes.xywh.cpu().numpy() if boxes.xywh is not None else []
            conf = boxes.conf.cpu().numpy() if boxes.conf is not None else []

            if len(xywh) > 0:
                tracks = self.tracker.update(xywh, conf, rgb_frame)

                for track in self.tracker.tracker.tracks:
                    if not track.is_confirmed() or track.time_since_update > 1:
                        continue

                    track_id = track.track_id
                    x1, y1, x2, y2 = map(int, track.to_tlbr())

                    h, w, _ = frame.shape
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)

                    color = (0, 255, 0)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"Person-{track_id}", (x1 + 10, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)

                    if track_id not in self.unique_ids:
                        self.unique_ids.add(track_id)

                        person_img = frame[y1:y2, x1:x2]

                        if person_img.size > 0:
                            response = self.save_person_image(track_id, person_img)
                            logger.info(response)
                        # Asynchronously handle database insert and image saving
                        self.insert_to_database(track_id, response)

    def run(self):
        """ Main loop to capture video and process frames """
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            self.process_frame(frame)

            # FPS Calculation
            self.counter += 1
            elapsed = time.perf_counter() - self.start_time
            if elapsed > 1:
                self.fps = self.counter / elapsed
                self.counter = 0
                self.start_time = time.perf_counter()

            cv2.putText(frame, f"Count: {len(self.unique_ids)}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(frame, f"FPS: {self.fps:.2f}", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

            cv2.imshow("Live Person Tracking", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        self.cap.release()
        cv2.destroyAllWindows()
