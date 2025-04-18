import os
import datetime
import requests

class VoiceAutorization:
    def __init__(self, s3_manager, audio_processor):
        self.s3_manager = s3_manager
        self.audio_processor = audio_processor

    def download_and_process_audio(self, s3_folder):
        # Get the latest audio file from S3
        latest_audio_file = self.s3_manager.get_latest_audio_file(s3_folder)
        
        if latest_audio_file is None:
            return {"error": "No audio files found or no AWS credentials provided."}

        # Define local paths
        timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H-%M-%S-%fZ")
        local_file_path = os.path.join(os.getcwd(), "latest_audio_file")
        converted_file_path = os.path.join(os.getcwd(), "new.wav")
        
        try:
            # Download the latest audio file from S3 to the local path
            self.s3_manager.s3_client.download_file(self.s3_manager.bucket_name, latest_audio_file, local_file_path)

            # Convert the audio file to .wav format
            self.audio_processor.convert_to_wav(local_file_path, converted_file_path)

            # Verify the downloaded audio with the owner's audio
            score, prediction = self.audio_processor.verify_speaker("owner5.wav", "owner5 copy.wav")
            result = "Same speaker" if prediction else "Different speakers"

            if result == "Same speaker":
                url = 'http://52.66.120.228:8000/turn-on'
                headers = {'accept': 'application/json'}
                
                try:
                    response = requests.post(url, headers=headers)
                    response.raise_for_status()  # Raise an error for bad responses
                    device_status = response.text
                except requests.exceptions.RequestException as e:
                    device_status = f"Error with device response: {str(e)}"
            else:
                device_status = "Speaker verification failed."

            return {
                "message": f"File {latest_audio_file} downloaded and converted to {converted_file_path}",
                "verification_result": f"Score: {score}, Prediction: {result}",
                "device": device_status
            }
        except Exception as e:
            return {"error": str(e)}

