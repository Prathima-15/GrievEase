
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BarChart4,
  FileText,
  Clock,
  CheckCircle,
  Users,
  Settings,
  Search,
  ArrowRight,
  Plus,
  X,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Types for API responses
interface Statistics {
  petition_counts: {
    pending: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    total: number;
  };
  user_counts: {
    total_users: number;
    total_officers: number;
  };
  recent_activity: {
    recent_petitions: number;
  };
}

interface AdminPetition {
  petition_id: number;
  title: string;
  short_description: string;
  description: string;
  department: string;
  category: string;
  urgency_level: string;
  location?: string;
  proof_files: string[];
  due_date: string;
  submitted_at: string;
  status: string;
  user_name: string;
  user_email: string;
}

// Define status badge colors
const STATUS_COLORS = {
  'open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'escalated': 'bg-purple-100 text-purple-800 border-purple-200'
};

// Map backend status to display status
const STATUS_DISPLAY = {
  'open': 'Pending',
  'in_progress': 'In Progress',
  'resolved': 'Resolved',
  'rejected': 'Rejected',
  'escalated': 'Escalated'
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [petitions, setPetitions] = useState<AdminPetition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Fetch dashboard statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // Fallback: calculate from petitions if statistics endpoint fails
      try {
        const response = await fetch('http://localhost:8000/admin/petitions', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        if (response.ok) {
          const petitions = await response.json();
          
          const stats = {
            petition_counts: {
              pending: petitions.filter((p: any) => p.status === 'submitted').length,
              in_progress: petitions.filter((p: any) => p.status === 'in_progress').length,
              resolved: petitions.filter((p: any) => p.status === 'resolved').length,
              rejected: petitions.filter((p: any) => p.status === 'rejected').length,
              total: petitions.length
            },
            user_counts: {
              total_users: 0,
              total_officers: 0
            },
            recent_activity: {
              recent_petitions: petitions.filter((p: any) => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return new Date(p.submitted_at) >= sevenDaysAgo;
              }).length
            }
          };

          setStatistics(stats);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    }
  };

  // Fetch petitions based on status
  const fetchPetitions = async (status?: string) => {
    try {
      const url = new URL('http://localhost:8000/admin/petitions');
      if (status && status !== 'all') {
        url.searchParams.append('status', status);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch petitions');
      }

      const data = await response.json();
      // Enhanced backend returns petitions array directly for admin endpoint
      setPetitions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching petitions:', error);
      toast({
        title: "Error",
        description: "Failed to load petitions",
        variant: "destructive",
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStatistics(),
        fetchPetitions(activeTab === 'all' ? undefined : activeTab)
      ]);
      setIsLoading(false);
    };

    if (user?.token) {
      loadData();
    }
  }, [user?.token]);

  // Reload petitions when tab changes
  useEffect(() => {
    if (user?.token && !isLoading) {
      fetchPetitions(activeTab === 'all' ? undefined : activeTab);
    }
  }, [activeTab, user?.token]);
  
  const filteredPetitions = petitions.filter(petition => {
    // Filter by search query
    if (
      searchQuery &&
      !petition.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !petition.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !petition.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  const handleUpdateStatus = async (petitionId: number, newStatus: string) => {
    setIsUpdating(petitionId);
    
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`http://localhost:8000/admin/petitions/${petitionId}/status`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh petitions and statistics
      await Promise.all([
        fetchPetitions(activeTab === 'all' ? undefined : activeTab),
        fetchStatistics()
      ]);
      
      toast({
        title: "Status updated",
        description: `Petition status has been updated to ${STATUS_DISPLAY[newStatus as keyof typeof STATUS_DISPLAY]}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update petition status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage petitions and monitor system performance
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search petitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-blue-border focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <h3 className="text-3xl font-bold mt-1">
                  {isLoading ? '...' : statistics?.petition_counts.pending || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <h3 className="text-3xl font-bold mt-1">
                  {isLoading ? '...' : statistics?.petition_counts.in_progress || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Resolved</p>
                <h3 className="text-3xl font-bold mt-1">
                  {isLoading ? '...' : statistics?.petition_counts.resolved || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Petitions</p>
                <h3 className="text-3xl font-bold mt-1">
                  {isLoading ? '...' : statistics?.petition_counts.total || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart4 className="h-6 w-6 text-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Admin Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          <Link to="/dashboard" className="flex items-center px-4 py-2 mr-4 bg-primary-blue text-white rounded-md">
            <FileText className="h-4 w-4 mr-2" />
            <span>Petitions</span>
          </Link>
          <Link to="/admin/register-officer" className="flex items-center px-4 py-2 mr-4 text-gray-700 hover:text-primary-blue">
            <Plus className="h-4 w-4 mr-2" />
            <span>Register Officer</span>
          </Link>
          <Link to="/dashboard/analytics" className="flex items-center px-4 py-2 mr-4 text-gray-700 hover:text-primary-blue">
            <BarChart4 className="h-4 w-4 mr-2" />
            <span>Analytics</span>
          </Link>
          <Link to="/dashboard/users" className="flex items-center px-4 py-2 mr-4 text-gray-700 hover:text-primary-blue">
            <Users className="h-4 w-4 mr-2" />
            <span>Department Users</span>
          </Link>
          <Link to="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-700 hover:text-primary-blue">
            <Settings className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </Link>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-blue-300" 
                onClick={() => navigate('/admin/register-officer')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Register Officer</h3>
                <p className="text-sm text-gray-600">Add new admin user</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-green-300"
                onClick={() => navigate('/dashboard/users')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-gray-600">View all users & officers</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-purple-300"
                onClick={() => navigate('/dashboard/analytics')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View detailed reports</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-orange-300"
                onClick={() => navigate('/dashboard/settings')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-gray-600">System configuration</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>
        </div>

        {/* Petition Management */}
        <div className="bg-white rounded-lg shadow-lg">
          <Tabs defaultValue="submitted" value={activeTab} onValueChange={setActiveTab}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold mb-4">Petition Management</h2>
              <TabsList>
                <TabsTrigger value="submitted">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="p-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading petitions...</p>
                </div>
              ) : filteredPetitions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="px-4 py-3 text-gray-600 font-semibold">Petition</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Category</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Status</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Urgency</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Submitted</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPetitions.map((petition) => (
                        <tr key={petition.petition_id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <Link 
                                to={`/petitions/${petition.petition_id}`} 
                                className="font-medium hover:text-primary-blue transition-colors"
                              >
                                {petition.title}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">By {petition.user_name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="bg-blue-50">
                              {petition.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                              {STATUS_DISPLAY[petition.status as keyof typeof STATUS_DISPLAY]}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge 
                              variant="outline" 
                              className={
                                petition.urgency_level === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                petition.urgency_level === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-green-50 text-green-700 border-green-200'
                              }
                            >
                              {petition.urgency_level}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {new Date(petition.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-primary-blue text-primary-blue"
                              >
                                <Link to={`/petitions/${petition.petition_id}`}>View</Link>
                              </Button>
                              {petition.status === 'submitted' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(petition.petition_id, 'in_progress')}
                                  disabled={isUpdating === petition.petition_id}
                                  className="bg-primary-blue hover:bg-blue-600"
                                >
                                  {isUpdating === petition.petition_id ? 'Updating...' : 'Accept'}
                                </Button>
                              )}
                              {petition.status === 'in_progress' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(petition.petition_id, 'resolved')}
                                  disabled={isUpdating === petition.petition_id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isUpdating === petition.petition_id ? 'Updating...' : 'Resolve'}
                                </Button>
                              )}
                              {(petition.status === 'submitted' || petition.status === 'in_progress') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(petition.petition_id, 'rejected')}
                                  disabled={isUpdating === petition.petition_id}
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                >
                                  {isUpdating === petition.petition_id ? 'Updating...' : 'Reject'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No petitions found matching your search criteria.</p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="border-primary-blue text-primary-blue"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
              
              {filteredPetitions.length > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {filteredPetitions.length} petitions
                  </p>
                  <Button asChild variant="outline" className="text-primary-blue border-primary-blue">
                    <Link to="/dashboard/petitions">
                      View All Petitions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
