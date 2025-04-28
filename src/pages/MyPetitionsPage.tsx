
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for user petitions
const MOCK_MY_PETITIONS = [
  {
    id: '1',
    title: 'Fix the pothole on Main Street',
    description: 'The large pothole on Main Street has been causing traffic issues and damage to vehicles.',
    category: 'Infrastructure',
    status: 'In Progress',
    signatureCount: 156,
    createdAt: '2025-04-15',
    updates: 2
  },
  {
    id: '2',
    title: 'Install traffic light at dangerous intersection',
    description: 'The intersection of Park Road and Hill Street has seen multiple accidents and needs a traffic light.',
    category: 'Safety',
    status: 'Pending',
    signatureCount: 89,
    createdAt: '2025-04-22',
    updates: 0
  },
  {
    id: '3',
    title: 'Renovate community playground',
    description: 'The playground equipment is outdated and poses safety risks to children.',
    category: 'Recreation',
    status: 'Completed',
    signatureCount: 342,
    createdAt: '2025-03-10',
    updates: 5
  }
];

// Define status badge colors
const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200'
};

// Format date to readable string
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const MyPetitionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  
  // Filter petitions based on active tab and search query
  const filteredPetitions = MOCK_MY_PETITIONS.filter(petition => {
    // Filter by status
    if (activeTab !== 'all' && petition.status.toLowerCase() !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (
      searchQuery &&
      !petition.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !petition.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !petition.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  // Count petitions by status
  const pendingCount = MOCK_MY_PETITIONS.filter(p => p.status === 'Pending').length;
  const inProgressCount = MOCK_MY_PETITIONS.filter(p => p.status === 'In Progress').length;
  const completedCount = MOCK_MY_PETITIONS.filter(p => p.status === 'Completed').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Petitions</h1>
            <p className="text-gray-600">
              Manage and track all your submitted petitions
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/petitions/create">
              <Button className="bg-primary-blue hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create New Petition
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="md:flex-row items-center justify-between mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 md:mb-0">
              <div className='flex'>
                <TabsList>
                  <TabsTrigger value="all">
                    All ({MOCK_MY_PETITIONS.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({pendingCount})
                  </TabsTrigger>
                  <TabsTrigger value="in progress">
                    In Progress ({inProgressCount})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedCount})
                  </TabsTrigger>
                </TabsList>
                <div className="relative justify-end flex-grow flex">
                  <Search className="absolute right-5 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search your petitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-64"
                  />
                </div>
              </div>

              <div className="mt-6">
                {filteredPetitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPetitions.map(petition => (
                      <Card key={petition.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                        <CardContent className="p-6 flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                              {petition.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(petition.createdAt)}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2">
                            <Link to={`/petitions/${petition.id}`} className="hover:text-primary-blue transition-colors">
                              {petition.title}
                            </Link>
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {petition.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-blue-50">
                              {petition.category}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              <strong>{petition.signatureCount}</strong> signatures
                            </span>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="bg-gray-50 p-4 border-t">
                          <div className="w-full flex justify-between items-center">
                            <div className="text-sm">
                              {petition.updates > 0 ? (
                                <span className="text-primary-blue font-medium">
                                  {petition.updates} {petition.updates === 1 ? 'update' : 'updates'}
                                </span>
                              ) : (
                                <span className="text-gray-500">No updates yet</span>
                              )}
                            </div>
                            <Link to={`/petitions/${petition.id}`}>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-primary-blue border-primary-blue hover:bg-blue-50"
                              >
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No petitions found</h3>
                    {searchQuery ? (
                      <div>
                        <p className="text-gray-600 mb-6">
                          Try adjusting your search query.
                        </p>
                        <Button
                          onClick={() => setSearchQuery('')}
                          variant="outline"
                          className="border-primary-blue text-primary-blue hover:bg-blue-50"
                        >
                          Clear Search
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-6">
                          You haven't created any petitions yet.
                        </p>
                        <Link to="/petitions/create">
                          <Button className="bg-primary-blue hover:bg-blue-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Petition
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPetitionsPage;
