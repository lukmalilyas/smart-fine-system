import boto3

class S3Manager:
    def __init__(self, access_key_id, secret_access_key, bucket_name, region):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )
        self.bucket_name = bucket_name

    def get_latest_audio_file(self, folder):
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix=folder)
            
            if 'Contents' not in response:
                return None
            
            audio_extensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.webm']
            audio_files = [
                file for file in response['Contents']
                if any(file['Key'].lower().endswith(ext) for ext in audio_extensions)
            ]
            
            if not audio_files:
                return None
            
            latest_audio_file = max(audio_files, key=lambda x: x['LastModified'])
            return latest_audio_file['Key']
        except Exception as e:
            print(f"Error in S3 operation: {e}")
            return None

