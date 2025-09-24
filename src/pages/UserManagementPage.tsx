import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  state: string;
  district: string;
  taluk: string;
  otp_verified: boolean;
  created_at: string;
  petition_count: number;
}

interface Officer {
  officer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department: string;
  designation: string;
  state: string;
  district: string;
  taluk: string;
  created_at: string;
}

const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'officers'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  // Fetch officers
  const fetchOfficers = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/officers', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch officers');
      }

      const data = await response.json();
      setOfficers(data);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: "Error",
        description: "Failed to load officers",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (activeTab === 'users') {
        await fetchUsers();
      } else {
        await fetchOfficers();
      }
      setIsLoading(false);
    };

    if (user?.token) {
      loadData();
    }
  }, [activeTab, user?.token]);

  // Filter data based on search and state
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number.includes(searchQuery);
    
    const matchesState = !selectedState || user.state === selectedState;
    
    return matchesSearch && matchesState;
  });

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      officer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.designation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = !selectedState || officer.state === selectedState;
    
    return matchesSearch && matchesState;
  });

  const exportData = () => {
    const data = activeTab === 'users' ? filteredUsers : filteredOfficers;
    const csvContent = activeTab === 'users' 
      ? [
          'Name,Email,Phone,State,District,Taluk,Verified,Petitions,Joined',
          ...data.map(user => 
            `"${user.first_name} ${user.last_name}","${user.email}","${user.phone_number}","${user.state}","${user.district}","${user.taluk}","${user.otp_verified ? 'Yes' : 'No'}","${user.petition_count}","${new Date(user.created_at).toLocaleDateString()}"`
          )
        ].join('\n')
      : [
          'Name,Email,Phone,Department,Designation,State,District,Taluk,Joined',
          ...data.map(officer => 
            `"${officer.first_name} ${officer.last_name}","${officer.email}","${officer.phone_number}","${officer.department}","${officer.designation}","${officer.state}","${officer.district}","${officer.taluk}","${new Date(officer.created_at).toLocaleDateString()}"`
          )
        ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage registered users and officers
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-4">
            <Button
              onClick={exportData}
              variant="outline"
              className="border-primary-blue text-primary-blue"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button asChild className="bg-primary-blue hover:bg-blue-600">
              <Link to="/admin/register-officer">
                <Shield className="h-4 w-4 mr-2" />
                Add Officer
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'users'
                ? 'bg-primary-blue text-white'
                : 'text-gray-600 hover:text-primary-blue'
            }`}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Citizens ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'officers'
                ? 'bg-primary-blue text-white'
                : 'text-gray-600 hover:text-primary-blue'
            }`}
          >
            <Shield className="h-4 w-4 mr-2 inline" />
            Officers ({officers.length})
          </button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">All States</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
              <div className="flex items-center text-sm text-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                {activeTab === 'users' 
                  ? `${filteredUsers.length} of ${users.length} users`
                  : `${filteredOfficers.length} of ${officers.length} officers`
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading {activeTab}...</p>
              </div>
            ) : activeTab === 'users' ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.user_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {user.phone_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {user.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.district}, {user.taluk}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              user.otp_verified
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }
                          >
                            {user.otp_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            {user.petition_count} petitions
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No users found matching your criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Officer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOfficers.map((officer) => (
                      <tr key={officer.officer_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {officer.first_name} {officer.last_name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {officer.officer_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {officer.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {officer.phone_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {officer.department}
                          </div>
                          <div className="text-sm text-gray-500">
                            {officer.designation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {officer.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {officer.district}, {officer.taluk}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(officer.created_at).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOfficers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No officers found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage;