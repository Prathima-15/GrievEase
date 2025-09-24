import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';


type User = {
  token: string;
  firstName: string;
  email: string;
  role: 'user' | 'admin';
  userId?: number;
  officerId?: number;
  department?: string;
  designation?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (credentials: { 
    email?: string; 
    phone?: string; 
    password?: string; 
    otp?: string; 
    isAdmin?: boolean;
  }) => Promise<{ step: string }>;
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
    const storedUser = Cookies.get('grievEaseUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        Cookies.remove('grievEaseUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (credentials: { 
    email?: string; 
    phone?: string; 
    password?: string; 
    otp?: string; 
    isAdmin?: boolean;
  }) => {
    if (credentials.password && !credentials.otp) {
      // Step 1: Verify password with new backend endpoints
      const endpoint = credentials.isAdmin 
        ? 'http://localhost:8000/auth/admin/login' 
        : 'http://localhost:8000/auth/login';
      
      const formData = new FormData();
      formData.append('email', credentials.email || '');
      formData.append('password', credentials.password || '');
      
      const verifyRes = await fetch(endpoint, {
        method: 'POST',
        body: formData,
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
        }),
      });
  
      const otpData = await otpRes.json();
  
      if (!otpRes.ok) {
        throw new Error(otpData.detail || 'Failed to send OTP');
      }
  
      toast({
        title: "Password verified",
        description: "OTP has been sent to your registered email.",
      });
  
      return { step: 'otp_required' };
  
    } else if (credentials.otp) {
      // Step 3: Verify OTP and login
      const response = await fetch('http://localhost:7000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          otp: credentials.otp
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail?.message || 'Invalid OTP');
      }

      if (!pendingOtpVerification?.verifyData) {
        throw new Error('Session expired. Please try signing in again.');
      }
  
      // Create user object based on role using the enhanced backend response
      const userData = pendingOtpVerification.verifyData.user;
      const user: User = {
        token: pendingOtpVerification.verifyData.access_token,
        firstName: userData.firstName,
        email: userData.email,
        role: userData.isAdmin ? "admin" : "user",
      };

      // Add additional fields based on role
      if (userData.isAdmin) {
        user.officerId = userData.officer_id;
        user.department = userData.department;
        user.designation = userData.designation || '';
      } else {
        user.userId = userData.user_id;
      }
  
      setUser(user);
      Cookies.set('grievEaseUser', JSON.stringify(user), { 
        expires: 7, 
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });
  
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${user.firstName}`,
      });
  
      // Clear pending verification
      setPendingOtpVerification(null);
  
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
  
      // Use the new enhanced backend registration endpoint
      const requestData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone_number: userData.phone,
        email: userData.email,
        password: userData.password,
        state: userData.state,
        district: userData.district,
        taluk: userData.taluk,
        id_type: userData.idType,
        id_number: userData.idNumber
      };

      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      const responseData = await response.json();
      console.log("Server Response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.detail || "Sign up failed");
      }
  
      // ✅ Registration successful - now get token through login
      toast({
        title: "Registration successful",
        description: `Welcome ${userData.firstName}! Please sign in to continue.`,
      });
      
      // Note: The enhanced backend doesn't return token on registration
      // User needs to sign in after registration
      
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
    Cookies.remove('grievEaseUser');
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
