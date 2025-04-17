# AWS Lambda: Audio Transcription & Trigger API

This Lambda function listens for new audio files uploaded to an S3 bucket, sends them to Azure OpenAI Whisper for transcription, and triggers an external API if a specific phrase is detected.

## Features
- Downloads audio from S3.
- Uses Azure OpenAI Whisper for transcription.
- Compares result with a trigger phrase.
- Calls an external API when the phrase matches.