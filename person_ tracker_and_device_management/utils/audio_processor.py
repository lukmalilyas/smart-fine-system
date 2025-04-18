from pydub import AudioSegment
from speechbrain.inference.speaker import SpeakerRecognition


class AudioProcessor:
    def __init__(self, speaker_model_path="models/spkrec-ecapa-voxceleb"):
        self.verification = SpeakerRecognition.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir=speaker_model_path
        )

    def convert_to_wav(self, input_path, output_path):
        audio = AudioSegment.from_file(input_path)
        audio.export(output_path, format="wav")

    def verify_speaker(self, reference_audio, target_audio):
        score, prediction = self.verification.verify_files(reference_audio, target_audio)
        return score, prediction