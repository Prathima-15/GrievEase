
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';

interface SpeechToTextProps {
  onTranscriptChange: (transcript: string) => void;
  placeholder?: string;
  value?: string;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  onTranscriptChange,
  placeholder = "Click the microphone to start speaking...",
  value = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(value);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // This is a simulated speech recognition since we can't use the real browser API in the demo
  const simulatedRecognitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Sample texts to simulate speech recognition
  const sampleTexts = [
    "I'm writing to request the repair of a large pothole on Main Street that has been causing traffic issues.",
    "Our community needs better streetlights in Park Colony for improved safety at night.",
    "The water quality in our neighborhood has deteriorated recently and requires immediate attention.",
    "There's a need for additional waste bins in the public park to address littering problems.",
    "The local bus service frequency should be increased during peak hours to reduce overcrowding.",
  ];
  
  useEffect(() => {
    return () => {
      // Clean up timeout when component unmounts
      if (simulatedRecognitionRef.current) {
        clearTimeout(simulatedRecognitionRef.current);
      }
    };
  }, []);
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const startListening = () => {
    setIsListening(true);
    
    // Simulate speech recognition with random sample text
    simulatedRecognitionRef.current = setTimeout(() => {
      setIsProcessing(true);
      
      // After a "processing" delay, set the transcript with a random sample text
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        const newTranscript = transcript
          ? `${transcript} ${sampleTexts[randomIndex]}`
          : sampleTexts[randomIndex];
        
        setTranscript(newTranscript);
        onTranscriptChange(newTranscript);
        setIsProcessing(false);
        setIsListening(false);
      }, 2000); // Simulate processing delay
    }, 3000); // Simulate recording time
  };
  
  const stopListening = () => {
    setIsListening(false);
    
    if (simulatedRecognitionRef.current) {
      clearTimeout(simulatedRecognitionRef.current);
      simulatedRecognitionRef.current = null;
    }
    
    // Simulate processing after stopping
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTranscript = e.target.value;
    setTranscript(newTranscript);
    onTranscriptChange(newTranscript);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button
            type="button"
            onClick={toggleListening}
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            className={`rounded-full p-2 ${
              isListening ? "bg-red-500 hover:bg-red-600" : "border-primary-blue text-primary-blue"
            }`}
            disabled={isProcessing}
          >
            {isListening ? (
              <StopCircle className="h-6 w-8" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
            <span className="sr-only">{isListening ? "Stop recording" : "Start recording"}</span>
          </Button>
          
          {(isListening || isProcessing) && (
            <div className="ml-3">
              {isListening ? (
                <div className="flex items-center">
                  <span className="text-sm text-red-500 font-medium mr-2">Recording...</span>
                  <div className="flex items-end h-6">
                    {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                      <div
                        key={index}
                        className="sound-bar"
                        style={{ '--index': index } as React.CSSProperties}
                      ></div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-600">Processing your speech...</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <textarea
        value={transcript}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="w-full min-h-[150px] p-3 border border-blue-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
        disabled={isListening || isProcessing}
      />
    </div>
  );
};

export default SpeechToText;
