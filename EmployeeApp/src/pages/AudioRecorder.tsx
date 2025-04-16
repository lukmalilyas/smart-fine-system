import React, { useRef, useState, useEffect } from 'react';
import { Mic, StopCircle, Upload, AudioLines, FileAudio, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  }
});


function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOkbutton, setShowOkbutton] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Helper: Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start recording audio
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Build a blob from the recorded audio chunks
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setUploadedFileName(null);
        getLocation();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record audio.');
    }
  };

  // Stop recording audio
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Handle audio file selection from file input
  const handleUploadAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      setUploadedFileName(file.name);
      getLocation();
    } else {
      alert('Please upload a valid audio file.');
    }
  };

  // Clear selection after a successful upload
  const clearSelection = () => {
    setAudioURL(null);
    setUploadedFileName(null);
    setAudioBlob(null);
  };

  // Adapted upload function based on your video upload code snippet
  const handleUpload = async () => {
    if (!audioBlob || latitude === null || longitude === null) {
      alert('Missing audio or location data');
      return;
    }
    setIsLoading(true);

    // Create a location object using stored latitude & longitude
    const location = { latitude, longitude };
    const uniqueAudioTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // File and folder names
    const fileName = uploadedFileName || `audio_${uniqueAudioTimestamp}.webm`;
    const folderPrefix = 'audios';
    const audioKey = `${folderPrefix}/audios/${uniqueAudioTimestamp}_${fileName}`;
    const metadataKey = `${folderPrefix}/metadata/${uniqueAudioTimestamp}_${fileName}.json`;

    try {
      // Log file details
      console.log('Uploading audio file:', audioBlob);
      console.log('File type:', typeof audioBlob);

      // Upload the audio file to S3
      const audioUploadCommand = new PutObjectCommand({
        Bucket: 'licence-pro-s3',
        Key: audioKey,
        Body: await audioBlob.arrayBuffer(),
        ContentType: audioBlob.type,
      });
      await s3.send(audioUploadCommand);

      // Prepare and upload metadata as JSON
      const metadata = JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        uploadedAt: new Date().toISOString(),
      });
      const metadataUploadCommand = new PutObjectCommand({
        Bucket: 'licence-pro-s3',
        Key: metadataKey,
        Body: metadata,
        ContentType: 'application/json',
      });
      await s3.send(metadataUploadCommand);

      clearSelection();
      setShowOkbutton(true);
    } catch (error: any) {
      console.error('S3 upload error:', error);
      const fullMessage = `${error.name || 'Error'}: ${error.message || 'Unknown error occurred'}`;
      alert(`❌ Upload failed:\n${fullMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the component state
  const handleRefresh = () => {
    setIsRecording(false);
    setAudioURL(null);
    setUploadedFileName(null);
    setTimer(0);
    setLatitude(null);
    setLongitude(null);
    setAudioBlob(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Get current geolocation
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="container mx-auto px-4 py-8"
      
    >{/* Welcome Text */}
    <div className="text-center mt-6">
      <h2 className="text-3xl font-bold text-white">🎙️ Welcome!</h2>
      <p className="mt-2 text-zinc-400">Record and upload your audio files easily.</p>
    </div>
    
      <div className="max-w-md mx-auto mt-10">
        <motion.div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 relative">
          {/* Refresh Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            className="absolute top-4 right-4 bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw size={20} color="white" />
          </motion.button>

          {/* Heading */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-4 bg-zinc-800 rounded-2xl mb-4"
            >
              <AudioLines size={32} />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold"
            >
              Audio Recorder
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400"
            >
              Upload or record audio
            </motion.p>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div className="relative border border-zinc-700 rounded-2xl p-4 bg-zinc-800 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleUploadAudio}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <FileAudio size={24} />
                <span className="mt-2 text-zinc-400 text-sm">
                  {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click to choose a file'}
                </span>
              </div>
            </div>
          </div>

          {/* Recording and Upload Controls */}
          <div className="space-y-4">
            {!isRecording && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStartRecording}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 transition-colors text-white font-medium py-4 rounded-2xl"
              >
                <Mic size={20} />
                <span>Start Recording</span>
              </motion.button>
            )}

            {isRecording && (
              <>
                <div className="text-center text-sm text-zinc-400">
                  Recording Time: <span className="font-mono text-white">{formatTime(timer)}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStopRecording}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-medium py-4 rounded-2xl"
                >
                  <StopCircle size={20} />
                  <span>Stop Recording</span>
                </motion.button>
              </>
            )}

            {audioURL && (
              <>
                <audio controls src={audioURL} className="w-full mt-4 rounded-lg" />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUpload}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium py-4 rounded-2xl"
                >
                  <Upload size={20} />
                  <span>{isLoading ? 'Uploading...' : 'Upload Audio'}</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Location Display */}
          {latitude && longitude && (
            <div className="mt-6 text-center text-zinc-400">
              <p>Location:</p>
              <p>Latitude: {latitude.toFixed(4)}</p>
              <p>Longitude: {longitude.toFixed(4)}</p>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {showOkbutton && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="p-6 rounded-lg shadow-lg w-[90%] max-w-sm mx-4 bg-black text-white"
              >
                <h2 className="text-lg font-semibold mb-4">Successfull</h2>
                <p className="mb-6">File Uploaded Successfully</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowOkbutton(false)}
                    className="px-4 py-2 rounded-lg transition-colors bg-green-500 hover:bg-green-500/80"
                  >
                    Ok
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AudioRecorder;