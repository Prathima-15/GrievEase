
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { useToast } from '@/hooks/use-toast';

const SignInPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'phone' | 'email');
    setShowOtpInput(false);
    setOtp('');
    setPassword('');
  };
  
  const handleOtpChange = (value: string) => {
    setOtp(value);
  };
  
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.length <= 10 ? phoneNumber : phoneNumber.slice(0, 10);
  };

  const handleSendOtp = async () => {
    setIsSubmitting(true);
    
    try {
      if (activeTab === 'phone' && phone.length < 10) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        return;
      }

      if (activeTab === 'email' && !email.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      // Always require password first
      toast({
        title: "Password required",
        description: "Please enter your password to sign in",
      });
      
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Failed to send OTP",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    setIsSubmitting(true);
  
    try {
      if (!showOtpInput) {
        // Step 1: Validate initial inputs (email/phone + password)
        if (!password) {
          toast({
            title: "Password required",
            description: "Please enter your password",
            variant: "destructive",
          });
          return;
        }
  
        if (activeTab === "phone" && phone.length < 10) {
          toast({
            title: "Invalid phone number",
            description: "Please enter a valid phone number",
            variant: "destructive",
          });
          return;
        }
  
        if (activeTab === "email" && !email.includes("@")) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
          return;
        }
  
        // Step 2: Call signIn to verify password and trigger OTP
        const result = await signIn({
          phone: activeTab === "phone" ? phone : undefined,
          email: activeTab === "email" ? email : undefined,
          password,
        });
  
        if (result.step === "otp_required") {
          setShowOtpInput(true);
        }
      } else {
        // Step 3: Submit OTP
        if (otp.length !== 6) {
          toast({
            title: "Invalid OTP",
            description: "Please enter a valid 6-digit OTP",
            variant: "destructive",
          });
          return;
        }
  
        const result = await signIn({
          phone: activeTab === "phone" ? phone : undefined,
          email: activeTab === "email" ? email : undefined,
          otp,
        });
  
        if (result.step === "signed_in") {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Sign in failed:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again",
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to Grieve Ease</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="phone" className="space-y-4">
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                className="w-full"
                disabled={isSubmitting}
                maxLength={10}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            {/* OTP Input */}
            {showOtpInput && (
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="flex space-x-4">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleSendOtp}
                    disabled={isSubmitting || phone.length < 10}
                    className="bg-primary-blue hover:bg-blue-600"
                  >
                    {isSubmitting ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="email-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            {/* OTP Input */}
            {showOtpInput && (
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="flex space-x-4">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleSendOtp}
                    disabled={isSubmitting || !email.includes("@")}
                    className="bg-primary-blue hover:bg-blue-600"
                  >
                    {isSubmitting ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          {showOtpInput ? (
            <Button
              onClick={handleSignIn}
              disabled={otp.length < 6 || isSubmitting}
              className="w-full bg-primary-blue hover:bg-blue-600"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          ) : (
            <Button
              onClick={handleSignIn}
              disabled={
                (activeTab === 'phone' && phone.length < 10) ||
                (activeTab === 'email' && !email.includes('@')) ||
                !password ||
                isSubmitting
              }
              className="w-full bg-primary-blue hover:bg-blue-600"
            >
              {isSubmitting ? "Processing..." : "Sign In"}
            </Button>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-primary-blue hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;