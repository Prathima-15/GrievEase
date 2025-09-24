import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Building, MapPin } from 'lucide-react';

const OfficerRegistrationPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Department options
  const departments = [
    'Public Works Department',
    'Water Resources',
    'Transportation',
    'Healthcare',
    'Education',
    'Police Department',
    'Fire Department',
    'Municipal Corporation',
    'Revenue Department',
    'Agriculture Department',
    'Environment Department',
    'Social Welfare'
  ];

  // Designation options
  const designations = [
    'Assistant Engineer',
    'Junior Engineer',
    'Executive Engineer',
    'Superintendent Engineer',
    'Chief Engineer',
    'Inspector',
    'Sub-Inspector',
    'Deputy Collector',
    'Tahsildar',
    'Block Development Officer',
    'Medical Officer',
    'Principal',
    'Head Master',
    'Commissioner',
    'Other'
  ];

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.length <= 10 ? phoneNumber : phoneNumber.slice(0, 10);
  };

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return false;
    }

    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    if (!department || !designation) {
      toast({
        title: "Missing Information",
        description: "Please select department and designation.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the enhanced backend officer registration endpoint
      const requestData = {
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        password: password,
        department_id: 1, // Default department ID - should be fetched from departments endpoint
        designation: designation,
        state: state,
        district: district,
        taluk: taluk
      };

      const response = await fetch('http://localhost:8000/auth/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to register officer');
      }

      toast({
        title: "Officer Registered Successfully",
        description: `${firstName} ${lastName} has been registered as an officer.`,
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setDepartment('');
      setDesignation('');
      setState('');
      setDistrict('');
      setTaluk('');

      // Optionally navigate back to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Officer registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Register New Officer</h1>
            <p className="text-gray-600 mt-2">
              Add a new officer to the system
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-primary-blue mr-2" />
                    <h2 className="text-lg font-semibold">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="email">Email Address*</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@gov.in"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number*</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="password">Password*</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password*</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 text-primary-blue mr-2" />
                    <h2 className="text-lg font-semibold">Professional Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department*</Label>
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="designation">Designation*</Label>
                      <select
                        id="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        required
                      >
                        <option value="">Select Designation</option>
                        {designations.map(desig => (
                          <option key={desig} value={desig}>{desig}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-primary-blue mr-2" />
                    <h2 className="text-lg font-semibold">Location Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="district">District</Label>
                      <select
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      >
                        <option value="">Select District</option>
                        <option value="Salem">Salem</option>
                        <option value="Erode">Erode</option>
                        <option value="Coimbatore">Coimbatore</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Tiruppur">Tiruppur</option>
                        <option value="Tiruchirappalli">Tiruchirappalli</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="taluk">Taluk</Label>
                      <select
                        id="taluk"
                        value={taluk}
                        onChange={(e) => setTaluk(e.target.value)}
                        className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        disabled={!district}
                      >
                        <option value="">Select Taluk</option>
                        <option value="Kannankuruchi">Kannankuruchi</option>
                        <option value="Hasthampatti">Hasthampatti</option>
                        <option value="Kodumudi">Kodumudi</option>
                        <option value="Kovilpatti">Kovilpatti</option>
                        <option value="Sattur">Sattur</option>
                        <option value="Sivaganga">Sivaganga</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-blue hover:bg-blue-600"
                  >
                    {isSubmitting ? "Registering..." : "Register Officer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficerRegistrationPage;