import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Map, Upload, CheckCircle, FileText, Image, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SpeechToText from './SpeechToText';
import ProgressSteps from './ProgressSteps';

// Categories
// const CATEGORIES = [
//   'Infrastructure',
//   'Transportation',
//   'Healthcare',
//   'Education',
//   'Environment',
//   'Safety',
//   'Recreation',
//   'Others'
// ];

const PetitionCreatePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  // const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const totalSteps = 4;
  
  const steps = [
    { title: 'Details', icon: <FileText className="w-5 h-5" /> },
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
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4); // Go to success step
      
      toast({
        title: "Petition submitted successfully",
        description: "Your petition has been submitted for review.",
      });
    }, 2000);
  };
  
  const validateStep1 = () => {
    // return title.length >= 10 && category !== '' && visibility !== '';
    return title.length >= 10 && visibility !== '';
  };
  
  const validateStep2 = () => {
    return shortDescription.length >= 20 && longDescription.length >= 50;
  };
  
  // Determine if we can proceed to review
  const canProceedToReview = () => {
    return validateStep1() && validateStep2();
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
                  Start by providing basic information about your petition.
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
                      Be clear and specific about the issue you're addressing.
                    </p>
                  </div>
                  
                  {/* <div>
                    <Label htmlFor="category" className="block mb-2">
                      Category*
                    </Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      <option value="" disabled>Select a category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div> */}
                  
                  <div>
                    <Label className="block mb-2">
                      Petition Visibility*
                    </Label>
                    <RadioGroup value={visibility} onValueChange={setVisibility}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="cursor-pointer">
                          Public (Visible to everyone)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="cursor-pointer">
                          Private (Visible only to authorities)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Description */}
            {currentStep === 2 && (
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
                        placeholder="Your speech will be transcribed here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Location & Media */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Location & Media</h2>
                <p className="text-gray-600 text-sm">
                  Add location details and supporting media to strengthen your petition.
                </p>
                
                <div className="space-y-6">
                  {/* Location */}
                  <div>
                    <Label htmlFor="location" className="block mb-2">
                      Location (Optional)
                    </Label>
                    <div className="flex gap-4">
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location or use current location"
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
                      Adding a location helps authorities better understand the issue.
                    </p>
                  </div>
                  
                  {/* Media Upload */}
                  <div>
                    <Label className="block mb-2">
                      Supporting Media (Optional, max 5 files)
                    </Label>
                    <div className="border-2 border-dashed border-blue-border rounded-md p-4">
                      {media.length < 5 ? (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Drag and drop files, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Supported formats: JPEG, PNG, PDF (max 10MB)
                          </p>
                          <input
                            type="file"
                            id="media-upload"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={handleMediaUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('media-upload')?.click()}
                            className="border-primary-blue text-primary-blue"
                          >
                            Browse Files
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 text-center">
                          Maximum number of files reached (5)
                        </p>
                      )}
                    </div>
                    
                    {/* Media Preview */}
                    {mediaUrls.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Uploaded Media ({mediaUrls.length}/5)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {mediaUrls.map((url, index) => (
                            <div 
                              key={index}
                              className="relative group border rounded-md overflow-hidden aspect-square"
                            >
                              <img 
                                src={url} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Success */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Petition Submitted!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your petition has been submitted successfully and is now under review. You'll be notified when there are updates.
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
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="border-primary-blue text-primary-blue hover:bg-blue-50"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            {currentStep < 4 && (
              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    variant="outline"
                    className="border-primary-blue text-primary-blue"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {currentStep === 3 ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceedToReview() || isSubmitting}
                    className="bg-primary-blue hover:bg-blue-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Petition"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && !validateStep1()) ||
                      (currentStep === 2 && !validateStep2())
                    }
                    className="bg-primary-blue hover:bg-blue-600"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionCreatePage;
