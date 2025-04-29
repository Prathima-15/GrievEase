import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';

type SignUpStep = 1 | 2 | 3 | 4;

const SignUpPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SignUpStep>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [otp, setOtp] = useState('');
  const { toast } = useToast();
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const passwordStrength = calculatePasswordStrength(password);
  
  function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) {
      return { score: 0, label: "Too weak", color: "bg-gray-300" };
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine strength label and color
    if (score <= 2) {
      return { score: score, label: "Too weak", color: "bg-red-500" };
    } else if (score <= 4) {
      return { score: score, label: "Could be stronger", color: "bg-yellow-500" };
    } else {
      return { score: score, label: "Strong password", color: "bg-green-500" };
    }
  }
  
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length <= 10) {
      return phoneNumber;
    }
    
    return phoneNumber.slice(0, 10);
  };
  
  const formatIDNumber = (value: string, type: string) => {
    const digits = value.replace(/\D/g, '');
    
    switch (type) {
      case 'aadhaar':
        // Format as XXXX XXXX XXXX
        return digits.slice(0, 12).replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, p1, p2, p3) => {
          let result = p1;
          if (p2) result += ' ' + p2;
          if (p3) result += ' ' + p3;
          return result;
        });
        
      case 'voter':
        // Format as XXX000000
        return value.slice(0, 10);
        
      case 'pan':
        // Format as ABCDE0000X
        return value.toUpperCase().slice(0, 10);
        
      case 'dl':
        // Format as XX00 00000000
        return value.toUpperCase().slice(0, 13).replace(/(\w{4})(\w{0,8})/, (_, p1, p2) => {
          return p2 ? `${p1} ${p2}` : p1;
        });
        
      default:
        return value;
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      const fileType = selectedFile.type;
      if (
        fileType !== 'application/pdf' &&
        fileType !== 'image/jpeg' &&
        fileType !== 'image/png'
      ) {
        alert("File must be PDF, JPEG, or PNG");
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !email.includes('@')) {
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    return password.length >= 8 && password === confirmPassword;
  };

  const validateStep3 = () => {
    return otp.length === 6;
  };

  const validateStep4 = () => {
    return idNumber.trim() !== '' && file !== null && consent;
  };
  
  const handleSendOtp = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Add this header if the server supports it
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      toast({
        title: "OTP Sent",
        description: data.message || "A verification code has been sent to your email.",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      console.log("Verifying OTP:", otp);
      const response = await fetch("http://localhost:8000/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        }),
      });

      const data = await response.json();
      console.log("OTP Verification Response:", data);
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      return data.acknowledgment;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    }
  };

  const goToNextStep = async () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSendOtp();
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      const verified = await verifyOtp(otp);
      if (verified) { 
        setCurrentStep(4);
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct verification code.",
          variant: "destructive",
        });
      }
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as SignUpStep);
    }
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    
    try {
      await signUp({
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword
      });
      
      navigate('/sign-in');
    } catch (error) {
      console.error("Sign up failed:", error);
      toast({
        title: "Sign up failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-blue-border">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-6" />
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join Grieve Ease today</p>
        </div>
        
        {/* Step indicator */}
        <div className="flex justify-between mb-8">
          {/* Step 1: Account */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary-blue text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <span className="text-xs mt-1 text-gray-600">Account</span>
          </div>

          {/* Line between Step 1 and Step 2 */}
          <div className="flex-1 flex items-center">
            <div
              className={`h-1 w-full ${
                currentStep >= 2 ? 'bg-primary-blue' : 'bg-gray-200'
              }`}
            ></div>
          </div>

          {/* Step 2: Verification */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary-blue text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-xs mt-1 text-gray-600">Verification</span>
          </div>

          {/* Line between Step 2 and Step 3 */}
          <div className="flex-1 flex items-center">
            <div
              className={`h-1 w-full ${
                currentStep >= 3 ? 'bg-primary-blue' : 'bg-gray-200'
              }`}
            ></div>
          </div>

          {/* Step 3: Success */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-primary-blue text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </div>
            <span className="text-xs mt-1 text-gray-600">Success</span>
          </div>
        </div>
        
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name*
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name*
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address*
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number*
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                className="w-full"
                maxLength={10}
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Password */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password*
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full "
                />
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color}`} 
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-600">{passwordStrength.label}</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Must contain at least 8 characters, including upper/lowercase letters, numbers and special characters.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password*
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full "
                />
              </div>
              
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Email Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            
            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={(value) => setOtp(value)}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="text-center mt-4">
              <button
                onClick={handleSendOtp}
                className="text-primary-blue hover:underline text-sm"
                type="button"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: ID Verification */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="idType" className="block text-sm font-medium text-gray-700">
                ID Type*
              </label>
              <select
                id="idType"
                value={idType}
                onChange={(e) => {
                  setIdType(e.target.value);
                  setIdNumber(''); // Reset ID number when type changes
                }}
                className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="voter">Voter ID</option>
                <option value="pan">PAN Card</option>
                <option value="dl">Driving License</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                  ID Number*
                </label>
                <span
                  className="text-xs text-primary-blue cursor-help"
                  title={
                    idType === 'aadhaar'
                      ? 'Format: XXXX XXXX XXXX'
                      : idType === 'voter'
                      ? 'Format: XXX000000'
                      : idType === 'pan'
                      ? 'Format: ABCDE0000X'
                      : 'Format: XX00 00000000'
                  }
                >
                  Format Help
                </span>
              </div>
              <Input
                id="idNumber"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(formatIDNumber(e.target.value, idType))}
                className="w-full"
                placeholder={
                  idType === 'aadhaar'
                    ? 'XXXX XXXX XXXX'
                    : idType === 'voter'
                    ? 'XXX000000'
                    : idType === 'pan'
                    ? 'ABCDE0000X'
                    : 'XX00 00000000'
                }
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="idUpload" className="block text-sm font-medium text-gray-700">
                Upload ID Document* (PDF, JPEG, or PNG, max 5MB)
              </label>
              <div className="border-2 border-dashed border-blue-border rounded-md p-4 text-center">
                <input
                  id="idUpload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div>
                    <p className="text-sm text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-sm text-primary-blue hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label htmlFor="idUpload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-4">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <p className="text-sm font-medium text-primary-blue">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPEG, or PNG</p>
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-3 mt-4">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
              />
              <label htmlFor="consent" className="text-sm text-gray-600">
                I consent to Grieve Ease verifying my information and using it in accordance with the{' '}
                <Link to="/privacy" className="text-primary-blue hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
        )}
        
        {/* Navigation buttons */}
        {currentStep !== 4 ? (
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="border-primary-blue text-primary-blue"
              >
                Back
              </Button>
            )}
            
            <Button
              onClick={goToNextStep}
              disabled={
                (currentStep === 1 && !validateStep1()) ||
                (currentStep === 2 && !validateStep2()) ||
                (currentStep === 3 && !validateStep3())
              }
              className={`${currentStep === 1 ? 'ml-auto' : ''} bg-primary-blue hover:bg-blue-600`}
            >
              Continue
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSignUp}
            disabled={!validateStep4() || isSubmitting}
            className="w-full mt-8 bg-primary-blue hover:bg-blue-600"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        )}
        
        {currentStep === 1 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary-blue hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
