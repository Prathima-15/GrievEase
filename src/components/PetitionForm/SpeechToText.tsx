
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import AudioRecorderModal from './AudioRecorderModal';

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
  const [transcript, setTranscript] = useState(value);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setTranscript(value);
  }, [value]);
  
  const handleTranscriptReceived = (tamilTranscript: string, englishTranslation: string) => {
    // Only use the English translation
    const newTranscript = transcript 
      ? `${transcript}\n\n${englishTranslation}` 
      : englishTranslation;
    
    setTranscript(newTranscript);
    onTranscriptChange(newTranscript);
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTranscript = e.target.value;
    setTranscript(newTranscript);
    onTranscriptChange(newTranscript);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          size="sm"
          className="rounded-full p-2 border-primary-blue text-primary-blue hover:bg-blue-50"
        >
          <Mic className="h-5 w-5" />
          <span className="ml-2">Record Audio</span>
        </Button>
      </div>
      
      <textarea
        value={transcript}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="w-full min-h-[150px] p-3 border border-blue-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
      />

      <AudioRecorderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTranscriptReceived={handleTranscriptReceived}
      />
    </div>
  );
};

export default SpeechToText;
