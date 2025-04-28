
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (credentials: { email?: string; phone?: string; password?: string; otp?: string; }) => Promise<void>;
  signUp: (userData: Partial<User> & { password: string; confirmPassword: string; }) => Promise<void>;
  signOut: () => void;
  verifyOtp: (otp: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user for demo
const ADMIN_USER = {
  id: 'admin-1',
  firstName: 'Praveen',
  lastName: 'Anitha',
  email: 'praveenanitha451@gmail.com',
  phone: '9952366108',
  role: 'admin' as const,
  password: '@Praveen72'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOtpVerification, setPendingOtpVerification] = useState<{email?: string; phone?: string} | null>(null);
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
    setIsLoading(true);
    
    try {
      // For demo, we'll implement a simple authentication mechanism
      if (credentials.otp) {
        // Handle OTP verification
        if (credentials.otp === '123456') { // Mock OTP
          if (pendingOtpVerification?.phone === ADMIN_USER.phone || 
              pendingOtpVerification?.email === ADMIN_USER.email) {
            setUser(ADMIN_USER);
            localStorage.setItem('grieveEaseUser', JSON.stringify(ADMIN_USER));
            toast({
              title: "Signed in successfully",
              description: "Welcome back, " + ADMIN_USER.firstName,
            });
          } else {
            // Create a mock user
            const mockUser: User = {
              id: Math.random().toString(36).substring(2, 9),
              firstName: 'Demo',
              lastName: 'User',
              email: pendingOtpVerification?.email || 'demo@example.com',
              phone: pendingOtpVerification?.phone || '1234567890',
              role: 'user',
            };
            
            setUser(mockUser);
            localStorage.setItem('grieveEaseUser', JSON.stringify(mockUser));
            
            toast({
              title: "Signed in successfully",
              description: "Welcome back, Demo User",
            });
          }
          setPendingOtpVerification(null);
        } else {
          toast({
            title: "Invalid OTP",
            description: "Please enter the correct OTP",
            variant: "destructive",
          });
        }
      } else if (credentials.password) {
        // Handle password-based login
        if (credentials.email === ADMIN_USER.email && 
            credentials.password === ADMIN_USER.password) {
          setUser(ADMIN_USER);
          localStorage.setItem('grieveEaseUser', JSON.stringify(ADMIN_USER));
          toast({
            title: "Signed in successfully",
            description: "Welcome back, " + ADMIN_USER.firstName,
          });
        } else if (credentials.phone === ADMIN_USER.phone && 
                 credentials.password === ADMIN_USER.password) {
          setUser(ADMIN_USER);
          localStorage.setItem('grieveEaseUser', JSON.stringify(ADMIN_USER));
          toast({
            title: "Signed in successfully",
            description: "Welcome back, " + ADMIN_USER.firstName,
          });
        } else {
          // For demo purposes, allow any other login
          const mockUser: User = {
            id: Math.random().toString(36).substring(2, 9),
            firstName: 'Demo',
            lastName: 'User',
            email: credentials.email || 'demo@example.com',
            phone: credentials.phone || '1234567890',
            role: 'user',
          };
          
          setUser(mockUser);
          localStorage.setItem('grieveEaseUser', JSON.stringify(mockUser));
          
          toast({
            title: "Signed in successfully",
            description: "Welcome back, Demo User",
          });
        }
      } else {
        // Store pending verification for OTP
        setPendingOtpVerification({
          email: credentials.email,
          phone: credentials.phone
        });
        
        toast({
          title: "OTP Sent",
          description: "Please check your phone/email for the OTP",
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: Partial<User> & { password: string; confirmPassword: string; }) => {
    setIsLoading(true);
    
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      // For demo, we'll create a basic user
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        firstName: userData.firstName || 'New',
        lastName: userData.lastName || 'User',
        email: userData.email || 'new@example.com',
        phone: userData.phone || '0000000000',
        role: 'user', // Only admins can create admin accounts
      };
      
      setUser(newUser);
      localStorage.setItem('grieveEaseUser', JSON.stringify(newUser));
      
      toast({
        title: "Account created successfully",
        description: "Welcome to Grieve Ease, " + newUser.firstName,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = "Failed to create account";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
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

  const verifyOtp = async (otp: string) => {
    if (otp === '123456') { // Mock OTP verification
      if (pendingOtpVerification?.phone === ADMIN_USER.phone || 
          pendingOtpVerification?.email === ADMIN_USER.email) {
        setUser(ADMIN_USER);
        localStorage.setItem('grieveEaseUser', JSON.stringify(ADMIN_USER));
      } else {
        // Create a mock user
        const mockUser: User = {
          id: Math.random().toString(36).substring(2, 9),
          firstName: 'Demo',
          lastName: 'User',
          email: pendingOtpVerification?.email || 'demo@example.com',
          phone: pendingOtpVerification?.phone || '1234567890',
          role: 'user',
        };
        
        setUser(mockUser);
        localStorage.setItem('grieveEaseUser', JSON.stringify(mockUser));
      }
      setPendingOtpVerification(null);
      
      toast({
        title: "OTP verified successfully",
      });
      
      return Promise.resolve();
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive",
      });
      
      return Promise.reject(new Error("Invalid OTP"));
    }
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
        signOut,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
