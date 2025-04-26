
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for dashboard
const MOCK_STATS = {
  pending: 24,
  inProgress: 18,
  completed: 42,
  total: 84
};

const MOCK_PETITIONS = [
  {
    id: '1',
    title: 'Fix the pothole on Main Street',
    category: 'Infrastructure',
    status: 'Pending',
    submittedOn: '2025-04-15',
    submittedBy: 'Arun Kumar'
  },
  {
    id: '2',
    title: 'Install streetlights in Park Colony',
    category: 'Safety',
    status: 'In Progress',
    submittedOn: '2025-04-10',
    submittedBy: 'Priya Sharma'
  },
  {
    id: '3',
    title: 'Clean the Ganges river bank',
    category: 'Environment',
    status: 'Completed',
    submittedOn: '2025-03-28',
    submittedBy: 'Rahul Singh'
  },
  {
    id: '4',
    title: 'Improve bus service frequency',
    category: 'Transportation',
    status: 'Pending',
    submittedOn: '2025-04-02',
    submittedBy: 'Deepa Patel'
  },
  {
    id: '5',
    title: 'Repair playground equipment',
    category: 'Recreation',
    status: 'In Progress',
    submittedOn: '2025-04-08',
    submittedBy: 'Mohammed Khan'
  },
  {
    id: '6',
    title: 'Request for free health camp',
    category: 'Healthcare',
    status: 'Completed',
    submittedOn: '2025-04-12',
    submittedBy: 'Dr. Vijay Reddy'
  }
];

// Define status badge colors
const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200'
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const filteredPetitions = MOCK_PETITIONS.filter(petition => {
    // Filter by status
    if (activeTab !== 'all' && petition.status.toLowerCase().replace(' ', '-') !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (
      searchQuery &&
      !petition.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !petition.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !petition.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  const handleUpdateStatus = (petitionId: string, newStatus: string) => {
    // In a real application, we would update the petition status via an API
    
    toast({
      title: "Status updated",
      description: `Petition status has been updated to ${newStatus}.`,
    });
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
                <h3 className="text-3xl font-bold mt-1">{MOCK_STATS.pending}</h3>
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
                <h3 className="text-3xl font-bold mt-1">{MOCK_STATS.inProgress}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <h3 className="text-3xl font-bold mt-1">{MOCK_STATS.completed}</h3>
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
                <h3 className="text-3xl font-bold mt-1">{MOCK_STATS.total}</h3>
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
        
        {/* Petition Management */}
        <div className="bg-white rounded-lg shadow-lg">
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold mb-4">Petition Management</h2>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="p-4">
              {filteredPetitions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="px-4 py-3 text-gray-600 font-semibold">Petition</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Category</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Status</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Submitted</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPetitions.map((petition) => (
                        <tr key={petition.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <Link to={`/petitions/${petition.id}`} className="font-medium hover:text-primary-blue transition-colors">
                                {petition.title}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">By {petition.submittedBy}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="bg-blue-50">
                              {petition.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                              {petition.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {petition.submittedOn}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-primary-blue text-primary-blue"
                              >
                                <Link to={`/petitions/${petition.id}`}>View</Link>
                              </Button>
                              {petition.status === 'Pending' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(petition.id, 'In Progress')}
                                  className="bg-primary-blue hover:bg-blue-600"
                                >
                                  Accept
                                </Button>
                              )}
                              {petition.status === 'In Progress' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(petition.id, 'Completed')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Complete
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
