import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Map, Upload, CheckCircle, FileText, Image, Check, Bot, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SpeechToText from './SpeechToText';
import ProgressSteps from './ProgressSteps';

interface AIClassificationResult {
  department: string;
  category: string;
  urgency_level: string;
  confidence: number;
  reasoning: string;
}

const PetitionCreatePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bangalore');
  const [taluk, setTaluk] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiClassification, setAiClassification] = useState<AIClassificationResult | null>(null);
  const [petitionId, setPetitionId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const totalSteps = 5;
  
  const steps = [
    { title: 'Details', icon: <FileText className="w-5 h-5" /> },
    { title: 'Location', icon: <Map className="w-5 h-5" /> },
    { title: 'Description', icon: <FileText className="w-5 h-5" /> },
    { title: 'Evidence', icon: <Image className="w-5 h-5" /> },
    { title: 'Review', icon: <Check className="w-5 h-5" /> }
  ];

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files) {
      // Convert FileList to array and limit to 5 files
      const fileArray = Array.from(files).slice(0, 5 - media.length);
      setMedia([...media, ...fileArray]);
      
      // Create URLs for previews
      const urls = fileArray.map(file => URL.createObjectURL(file));
      setMediaUrls([...mediaUrls, ...urls]);
    }
  };
  
  const removeMedia = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(mediaUrls[index]);
    
    setMedia(media.filter((_, i) => i !== index));
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };
  
  const handleCaptureLocation = () => {
    // Simulate geolocation capture
    setLocation("19.0760° N, 72.8777° E");
    
    toast({
      title: "Location captured",
      description: "Your current location has been added to the petition.",
    });
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      // Validate all required fields before submission
      if (!title || title.length < 10) {
        throw new Error("Title must be at least 10 characters long");
      }
      if (!shortDescription || shortDescription.length < 20) {
        throw new Error("Short description must be at least 20 characters long");
      }
      if (!longDescription || longDescription.length < 50) {
        throw new Error("Detailed description must be at least 50 characters long");
      }
      if (!state || !district) {
        throw new Error("State and district are required");
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('short_description', shortDescription);
      formData.append('description', longDescription);
      formData.append('state', state);
      formData.append('district', district);
      formData.append('is_public', visibility === 'public' ? 'true' : 'false');
      
      if (taluk) {
        formData.append('taluk', taluk);
      }
      if (location) {
        formData.append('location', location);
      }
      
      // Append all evidence files
      evidenceFiles.forEach((file) => {
        formData.append('files', file);
      });

      console.log('Submitting petition with data:', {
        title,
        shortDescription,
        longDescription,
        state,
        district,
        taluk,
        location,
        filesCount: evidenceFiles.length
      });

      const response = await fetch('http://localhost:8000/petitions/create', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Submission error:', errorData);
        throw new Error(errorData.detail || `Failed to submit petition (${response.status})`);
      }

      const data = await response.json();
      console.log('Petition submitted successfully:', data);
      
      // Store AI classification results and petition ID
      if (data.ai_classification) {
        setAiClassification(data.ai_classification);
      }
      if (data.petition_id) {
        setPetitionId(data.petition_id);
      }
      setIsSubmitted(true);
      
      toast({
        title: "🎉 Petition submitted successfully!",
        description: `Your petition has been automatically classified using AI and submitted for review. Petition ID: #${data.petition_id}`,
      });
    } catch (error) {
      console.error('Error submitting petition:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit petition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };
  
  const validateStep1 = () => {
    return title.length >= 10 && visibility !== '';
  };
  
  const validateStep2 = () => {
    return state !== '' && district !== '';
  };
  
  const validateStep3 = () => {
    return shortDescription.length >= 20 && longDescription.length >= 50;
  };
  
  const validateStep4 = () => {
    // Evidence files are optional, so always return true
    return true;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setEvidenceFiles([...evidenceFiles, ...fileArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };
  
  // Determine if we can proceed to review
  const canProceedToReview = () => {
    return validateStep1() && validateStep2() && validateStep3();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create a Petition</h1>
          <p className="text-gray-600 mb-8">
            Fill out the form below to submit your petition for review
          </p>
          
          <ProgressSteps currentStep={currentStep} steps={steps} />
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Petition Details</h2>
                <p className="text-gray-600 text-sm">
                  Start by providing basic information about your petition. Our AI will automatically classify it to the right department and determine the appropriate priority level.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="block mb-2">
                      Petition Title*
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Fix the pothole on Main Street"
                      className="w-full"
                    />
                    {title.length > 0 && title.length < 10 && (
                      <p className="text-sm text-red-500 mt-1">
                        Title should be at least 10 characters long.
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Be clear and specific about the issue you're addressing. Our AI will analyze your content to determine the appropriate priority level.
                    </p>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">
                      Petition Visibility*
                    </Label>
                    <RadioGroup value={visibility} onValueChange={setVisibility}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public">Public - Visible to everyone</Label>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private">Private - Only visible to authorities</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Location Information</h2>
                <p className="text-gray-600 text-sm">
                  Provide location details to help authorities understand where the issue is located.
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state" className="block mb-2">
                        State*
                      </Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="E.g., Karnataka"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="district" className="block mb-2">
                        District*
                      </Label>
                      <Input
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="E.g., Bangalore"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="taluk" className="block mb-2">
                      Taluk/Block (Optional)
                    </Label>
                    <Input
                      id="taluk"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      placeholder="E.g., Bangalore North"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="block mb-2">
                      Specific Location (Optional)
                    </Label>
                    <div className="flex gap-4">
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter specific location or landmark"
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={handleCaptureLocation}
                        variant="outline"
                        className="border-primary-blue"
                      >
                        <Map className="h-4 w-4 mr-2" />
                        Capture
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Adding specific location helps authorities better understand and locate the issue.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Description */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Petition Description</h2>
                <p className="text-gray-600 text-sm">
                  Provide details about your petition. You can use the speech-to-text feature by clicking the microphone icon.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shortDescription" className="block mb-2">
                      Short Description* (20-150 characters)
                    </Label>
                    <Input
                      id="shortDescription"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="A brief summary of your petition"
                      className="w-full"
                      maxLength={150}
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        This will appear in petition listings.
                      </p>
                      <p className="text-xs text-gray-500">
                        {shortDescription.length}/150
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="longDescription" className="block mb-2">
                      Detailed Description* (Use speech-to-text if preferred)
                    </Label>
                    <div className="mt-2">
                      <SpeechToText
                        onTranscriptChange={setLongDescription}
                        value={longDescription}
                        placeholder="Describe your issue in detail. Include what happened, when, and what action you'd like to see taken..."
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      A detailed description helps our AI classify your petition more accurately.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Evidence Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Upload Supporting Evidence</h2>
                <p className="text-gray-600 text-sm">
                  Upload any documents, images, or other files that support your petition. 
                  Multiple files are allowed.
                </p>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="evidenceFiles"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3"
                    />
                    <label 
                      htmlFor="evidenceFiles" 
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="text-gray-400">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload files</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG, MP4, MP3 (Max 10MB each)
                      </div>
                    </label>
                  </div>
                  
                  {evidenceFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">Selected Files:</h3>
                      {evidenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Evidence files help support your petition and improve classification accuracy.
                    Files are optional but recommended.
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 5: Review & AI Classification Results */}
            {currentStep === 5 && !isSubmitted && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Review Your Petition</h2>
                <p className="text-gray-600 text-sm">
                  Please review your petition details before submitting. Our AI will automatically analyze your petition and determine the appropriate department, category, and priority level.
                </p>
                
                {/* AI Classification Preview Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Will Analyze Your Petition
                  </h3>
                  <p className="text-blue-800 text-sm">
                    After submission, our AI system will:
                  </p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Classify to the appropriate government department</li>
                    <li>• Determine the specific category</li>
                    <li>• Analyze content to assign priority level (Low, Medium, High, Critical)</li>
                    <li>• Route to the right officials for faster resolution</li>
                  </ul>
                </div>
                
                {/* Petition Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Priority Level:</h4>
                    <p className="text-gray-700">
                      {aiClassification?.urgency_level ? 
                        `${aiClassification.urgency_level.charAt(0).toUpperCase() + aiClassification.urgency_level.slice(1)} (AI-determined)` : 
                        'Will be determined by AI after submission'
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Location:</h4>
                    <p className="text-gray-700">{state}, {district} {taluk && `, ${taluk}`}</p>
                    {location && <p className="text-gray-600 text-sm">{location}</p>}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Short Description:</h4>
                    <p className="text-gray-700">{shortDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Detailed Description:</h4>
                    <p className="text-gray-700">{longDescription}</p>
                  </div>
                  {evidenceFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">Evidence Files:</h4>
                      <p className="text-gray-700">{evidenceFiles.length} file(s) attached</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 5: Success */}
            {currentStep === 5 && isSubmitted && petitionId && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Petition Submitted Successfully!</h2>
                <p className="text-gray-600 mb-4">
                  Your petition has been submitted with ID: <strong>#{petitionId}</strong>
                </p>
                
                {/* AI Classification Summary */}
                {aiClassification && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <h3 className="font-semibold text-blue-900 mb-2">Routed to:</h3>
                    <p className="text-blue-800 font-medium">{aiClassification.department}</p>
                    <p className="text-blue-700 text-sm">{aiClassification.category}</p>
                  </div>
                )}
                
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your petition has been automatically routed to the appropriate department. 
                  You'll receive updates as your petition progresses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/petitions/my-petitions')}
                    variant="default"
                    className="bg-primary-blue hover:bg-blue-600"
                  >
                    View My Petitions
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setTitle('');
                      setVisibility('public');
                      setState('Karnataka');
                      setDistrict('Bangalore');
                      setTaluk('');
                      setLocation('');
                      setShortDescription('');
                      setLongDescription('');
                      setEvidenceFiles([]);
                      setIsSubmitted(false);
                      setPetitionId(null);
                      setAiClassification(null);
                    }}
                    variant="outline"
                  >
                    Create Another Petition
                  </Button>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            {!isSubmitted && (
              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    variant="outline"
                    className="border-primary-blue text-primary-blue"
                    disabled={isLoading || isSubmitting}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {currentStep === 5 ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceedToReview() || isLoading || isSubmitting}
                    className="bg-primary-blue hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading || isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Petition"
                    )}
                  </Button>
                ) : currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && !validateStep1()) ||
                      (currentStep === 2 && !validateStep2()) ||
                      (currentStep === 3 && !validateStep3()) ||
                      (currentStep === 4 && !validateStep4()) ||
                      isLoading ||
                      isSubmitting
                    }
                    className="bg-primary-blue hover:bg-blue-600"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionCreatePage;
