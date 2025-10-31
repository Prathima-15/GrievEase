import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, StopCircle, Upload, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReceived: (tamilTranscript: string, englishTranslation: string) => void;
}

const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReceived,
}) => {
  const [mode, setMode] = useState<'select' | 'upload' | 'record'>('select');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMode('select');
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingTime(0);
      setAudioFile(null);
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      audioChunksRef.current = [];
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast({
        title: "🎤 Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Recording stopped",
        description: "You can now submit your recording for transcription",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/m4a'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, WebM, OGG, M4A)",
          variant: "destructive",
        });
        return;
      }

      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      toast({
        title: "File selected",
        description: `${file.name} is ready for transcription`,
      });
    }
  };

  const handleSubmitTranscription = async () => {
    setIsProcessing(true);

    try {
      let fileToSend: File;

      if (mode === 'upload' && audioFile) {
        fileToSend = audioFile;
      } else if (mode === 'record' && audioBlob) {
        // Convert blob to file
        fileToSend = new File([audioBlob], `recording_${Date.now()}.webm`, {
          type: 'audio/webm',
        });
      } else {
        throw new Error('No audio file available');
      }

      const formData = new FormData();
      formData.append('audio_file', fileToSend);

      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Transcription failed');
      }

      const data = await response.json();
      
      if (data.tamil_transcript && data.english_translation) {
        onTranscriptReceived(data.tamil_transcript, data.english_translation);
        
        toast({
          title: "✅ Transcription successful",
          description: "Your audio has been transcribed and added to the description",
        });
        
        onClose();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Speech to Text</DialogTitle>
          <DialogDescription>
            Choose to upload an audio file or record live
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'select' && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setMode('upload')}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-500"
              >
                <Upload className="h-8 w-8 text-blue-600" />
                <span className="font-medium">Upload Audio File</span>
                <span className="text-xs text-gray-500">MP3, WAV, M4A, etc.</span>
              </Button>

              <Button
                onClick={() => setMode('record')}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-red-500"
              >
                <Mic className="h-8 w-8 text-red-600" />
                <span className="font-medium">Live Recording</span>
                <span className="text-xs text-gray-500">Record in real-time</span>
              </Button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Upload Audio File</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMode('select');
                    setAudioFile(null);
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="audioFileInput"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="audioFileInput" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP3, WAV, WebM, OGG, M4A (max. 50MB)
                  </p>
                </label>
              </div>

              {audioFile && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{audioFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {audioUrl && (
                    <audio controls className="w-full" src={audioUrl}>
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              )}

              <Button
                onClick={handleSubmitTranscription}
                disabled={!audioFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  'Submit for Transcription'
                )}
              </Button>
            </div>
          )}

          {mode === 'record' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Live Recording</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    }
                    setMode('select');
                    setAudioBlob(null);
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-8 text-center">
                {!isRecording && !audioBlob && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="rounded-full h-20 w-20 bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                )}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-lg font-medium text-red-600">Recording...</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-gray-700">
                      {formatTime(recordingTime)}
                    </div>
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      variant="destructive"
                      className="rounded-full h-20 w-20"
                    >
                      <StopCircle className="h-8 w-8" />
                    </Button>
                  </div>
                )}

                {!isRecording && audioBlob && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <div className="h-3 w-3 bg-green-500 rounded-full" />
                      <span className="font-medium">Recording complete</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-gray-700">
                      {formatTime(recordingTime)}
                    </div>
                    {audioUrl && (
                      <audio controls className="w-full" src={audioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setAudioBlob(null);
                          if (audioUrl) {
                            URL.revokeObjectURL(audioUrl);
                            setAudioUrl(null);
                          }
                          setRecordingTime(0);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Re-record
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {audioBlob && (
                <Button
                  onClick={handleSubmitTranscription}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    'Submit for Transcription'
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioRecorderModal;
