import boto3
import requests
import os
import json
from urllib.parse import unquote_plus

# Updated Constants
TARGET_LOCATION = {"latitude": 6.8838476, "longitude": 79.8569212}  
LOCATION_TOLERANCE = 0.1  # Acceptable deviation
TRIGGER_API_URL = "https://b285-2402-d000-813c-1463-796a-8c1b-28f8-d616.ngrok-free.app/authorize_voice"  # Light API

# AWS S3 client
s3 = boto3.client("s3")

def lambda_handler(event, context):
    print("Received event:", event)

    bucket_name = event['Records'][0]['s3']['bucket']['name']
    metadata_key = unquote_plus(event['Records'][0]['s3']['object']['key'])
    
    try:
        metadata_obj = s3.get_object(Bucket=bucket_name, Key=metadata_key)
        metadata_content = metadata_obj['Body'].read().decode('utf-8')
        metadata_json = json.loads(metadata_content)

        uploaded_lat = float(metadata_json.get('latitude', 0))
        uploaded_lon = float(metadata_json.get('longitude', 0))

        print(f"Location from metadata: {uploaded_lat}, {uploaded_lon}")

        if is_location_match(uploaded_lat, uploaded_lon):
            response = requests.post(TRIGGER_API_URL, headers={'accept': 'application/json'}, data='')
            print("Trigger API response:", response.status_code, response.text)
            return {"statusCode": 200, "body": "Trigger activated."}
        else:
            print("Location did not match.")
            return {"statusCode": 200, "body": "Location did not match. No trigger."}

    except Exception as e:
        print("Error processing metadata:", str(e))
        return {"statusCode": 500, "body": str(e)}

def is_location_match(lat, lon):
    lat_diff = abs(TARGET_LOCATION['latitude'] - lat)
    lon_diff = abs(TARGET_LOCATION['longitude'] - lon)
    return lat_diff <= LOCATION_TOLERANCE and lon_diff <= LOCATION_TOLERANCE