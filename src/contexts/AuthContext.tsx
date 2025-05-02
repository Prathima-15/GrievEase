import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type User = {
  token: string;
  firstName: string;
  email: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (credentials: { email?: string; phone?: string; password?: string; otp?: string; }) => Promise<{ step: string }>;
  signUp: (userData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string; 
    password: string; 
    confirmPassword: string; 
    state: string; 
    district: string; 
    taluk: string; 
    idType: string; 
    idNumber: string; 
    file: File; 
  }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user for demo
const ADMIN_USER = {
  token: 'admin-1',
  firstName: 'Praveen',
  email: 'sadhalegend@gmail.com',
  phone: '9952366108',
  role: 'admin' as const,
  password: 'sadha@123$'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOtpVerification, setPendingOtpVerification] = useState<{
    email?: string; 
    phone?: string;
    verifyData?: any;
  } | null>(null);
  const { toast } = useToast();

  // Check for stored authentication on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('grievEaseUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('grievEaseUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (credentials: { email?: string; phone?: string; password?: string; otp?: string; }) => {
    if (credentials.password && !credentials.otp) {
      // Step 1: Verify password
      const verifyRes = await fetch('http://localhost:8000/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
  
      const verifyData = await verifyRes.json();
  
      if (!verifyRes.ok) {
        throw new Error(verifyData.detail || 'Invalid credentials');
      }
  
      // Store verifyData in state for later use
      setPendingOtpVerification({
        email: credentials.email,
        phone: credentials.phone,
        verifyData: verifyData
      });
  
      // Step 2: Send OTP explicitly
      const otpRes = await fetch('http://localhost:7000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          phone: credentials.phone,
        }),
      });
  
      const otpData = await otpRes.json();
  
      if (!otpRes.ok) {
        throw new Error(otpData.detail || 'Failed to send OTP');
      }
  
      toast({
        title: "Password verified",
        description: "OTP has been sent to your registered email/phone.",
      });
  
      return { step: 'otp_required' };
  
    } else if (credentials.otp) {
      // Step 3: Verify OTP and login
      const response = await fetch('http://localhost:7000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || 'Invalid OTP');
      }

      if (!pendingOtpVerification?.verifyData) {
        throw new Error('Session expired. Please try signing in again.');
      }
  
      const user = {
        token: pendingOtpVerification.verifyData.access_token,
        firstName: pendingOtpVerification.verifyData.first_name,
        email: pendingOtpVerification.verifyData.email,
        role: "user" as const
      };
  
      setUser(user);
      localStorage.setItem('grieveEaseUser', JSON.stringify(user));
  
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${user.firstName}`,
      });
  
      return { step: 'signed_in' };
    }
  
    throw new Error('Invalid sign-in attempt');
  };
  

  const signUp = async (userData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string; 
    password: string; 
    confirmPassword: string; 
    state: string; 
    district: string; 
    taluk: string; 
    idType: string; 
    idNumber: string; 
    file: File; 
  }) => {
    setIsLoading(true);
  
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
  
      const formData = new FormData();
      formData.append("first_name", userData.firstName);
      formData.append("last_name", userData.lastName);
      formData.append("phone_number", userData.phone);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("state", userData.state);
      formData.append("district", userData.district);
      formData.append("taluk", userData.taluk);
      formData.append("id_type", userData.idType);
      formData.append("id_number", userData.idNumber);
      formData.append("id_proof", userData.file);
  
      const response = await fetch("http://localhost:8000/users/", {
        method: "POST",
        body: formData,
      });
  
      const responseData = await response.json();
      console.log("Server Response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || "Sign up failed");
      }

      if (!responseData.acknowledged) {
        throw new Error(responseData.message || "Sign up failed");
      }
  
      // ✅ Only runs if sign up is successful
      toast({
        title: "Sign up successful",
        description: `Welcome ${userData.firstName}! Your account has been created successfully.`,
      });
  
      const userObj: User = {
        token: responseData.token,
        firstName: responseData.firstname,
        email: responseData.email,
        role: "user",
      };
      setUser(userObj);
      
      localStorage.setItem("grieveEaseUser", JSON.stringify(userObj));
  
    } catch (error) {
      console.error("Sign up failed:", error);
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "Please check your information and try again",
        variant: "destructive",
      });
      throw error; // Re-throw the error to be handled by the component
    } finally {
      setIsLoading(false);
    }
  };
  

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('grieveEaseUser');
    toast({
      title: "Signed out successfully",
    });
  };

  

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export { useAuth };
