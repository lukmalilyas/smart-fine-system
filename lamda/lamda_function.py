import boto3
import requests
import os
from urllib.parse import unquote_plus

# Environment variables
OPEN_AI_KEY = os.getenv("OPEN_AI_KEY")
GPT_MODEL = "svc-primary-02-whisper"
API_VERSION = "2024-06-01"
ENDPOINT = f"https://sixertech-production-primary-openai.openai.azure.com/openai/deployments/{GPT_MODEL}/audio/translations?api-version={API_VERSION}"
TRIGGER_PHRASE = "please open the door."
TRIGGER_API_URL = os.getenv("TRIGGER_API_URL", "http://52.66.120.228:8000/turn-on")  # Default fallback
headers = { 'accept': 'application/json' }

# AWS S3 client
s3 = boto3.client("s3")

def lambda_handler(event, context):
    print("Received event:", event)

    bucket_name = event['Records'][0]['s3']['bucket']['name']
    object_key = unquote_plus(event['Records'][0]['s3']['object']['key'])
    download_path = f"/tmp/{os.path.basename(object_key)}"

    s3.download_file(bucket_name, object_key, download_path)

    with open(download_path, "rb") as audio_file:
        whisper_headers = { "api-key": OPEN_AI_KEY }
        files = { "file": (os.path.basename(download_path), audio_file, "audio/webm") }
        data = { "response_format": "json" }

        response = requests.post(ENDPOINT, headers=whisper_headers, files=files, data=data)

    if response.status_code == 200:
        transcript = response.json().get("text", "").strip().lower()
        print("Transcription:", transcript)

        if transcript == TRIGGER_PHRASE:
            try:
                trigger_response = requests.post(TRIGGER_API_URL, headers=headers, data='')
                print("Trigger API response:", trigger_response.status_code, trigger_response.text)
            except Exception as e:
                print("Trigger API call failed:", str(e))
        else:
            print("Trigger phrase not matched.")

        return {
            "statusCode": 200,
            "body": transcript
        }

    else:
        print("Whisper transcription failed:", response.text)
        return {
            "statusCode": response.status_code,
            "body": response.text
        }