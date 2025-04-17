import boto3
import requests
import os
import json
from urllib.parse import unquote_plus

# Constants
TARGET_LOCATION = {"latitude": 12.9716, "longitude": 77.5946}  # example
LOCATION_TOLERANCE = 0.001
TRIGGER_API_URL = "http://52.66.120.228:8000/turn-on"

# AWS S3 client
s3 = boto3.client("s3")

def lambda_handler(event, context):
    print("Received event:", event)

    bucket_name = event['Records'][0]['s3']['bucket']['name']
    audio_key = unquote_plus(event['Records'][0]['s3']['object']['key'])
    print(f"Audio uploaded: {audio_key}")

    # Derive the metadata JSON key from audio key
    file_name = os.path.basename(audio_key).replace(".webm", ".json")
    metadata_key = f"audios/metadata/{file_name}"
    print(f"Looking for metadata: {metadata_key}")

    try:
        metadata_obj = s3.get_object(Bucket=bucket_name, Key=metadata_key)
        metadata_content = metadata_obj['Body'].read().decode('utf-8')
        metadata_json = json.loads(metadata_content)

        uploaded_lat = float(metadata_json.get('latitude', 0))
        uploaded_lon = float(metadata_json.get('longitude', 0))
        print(f"Extracted Location: Latitude={uploaded_lat}, Longitude={uploaded_lon}")

        if is_location_match(uploaded_lat, uploaded_lon):
            try:
                response = requests.post(TRIGGER_API_URL, headers={'accept': 'application/json'}, data='')
                print("Trigger API response:", response.status_code, response.text)
                return {
                    "statusCode": 200,
                    "body": "Trigger activated."
                }
            except Exception as e:
                print("Trigger API call failed:", str(e))
                return {
                    "statusCode": 500,
                    "body": f"Trigger API call failed: {str(e)}"
                }
        else:
            print("Location did not match. Trigger not activated.")
            return {
                "statusCode": 200,
                "body": "Location did not match. Trigger skipped."
            }

    except s3.exceptions.NoSuchKey:
        print("Metadata JSON not found for this audio.")
        return {
            "statusCode": 404,
            "body": "Metadata JSON not found."
        }
    except Exception as e:
        print("Error reading metadata:", str(e))
        return {
            "statusCode": 500,
            "body": f"Error reading metadata: {str(e)}"
        }

def is_location_match(lat, lon):
    """Check if the uploaded location is within acceptable range."""
    lat_diff = abs(TARGET_LOCATION['latitude'] - lat)
    lon_diff = abs(TARGET_LOCATION['longitude'] - lon)
    return lat_diff <= LOCATION_TOLERANCE and lon_diff <= LOCATION_TOLERANCE