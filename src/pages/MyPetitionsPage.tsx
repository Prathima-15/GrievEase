import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define status badge colors
const STATUS_COLORS = {
  'submitted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
  'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'escalated': 'bg-orange-100 text-orange-800 border-orange-200'
};

// Status display mapping
const STATUS_DISPLAY = {
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'in_progress': 'In Progress',
  'resolved': 'Resolved',
  'rejected': 'Rejected',
  'escalated': 'Escalated'
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

interface Petition {
  petition_id: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  status: string;
  signatureCount: number;
  submitted_at: string;
  updates: number;
}

const MyPetitionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    let wsUser: WebSocket | null = null;
    let wsGlobal: WebSocket | null = null;
    let mounted = true;

    const fetchPetitions = async () => {
      try {
        const response = await fetch('http://localhost:8000/petitions/my', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch petitions');
        }

        const data = await response.json();
        // Enhanced backend returns { petitions: [], total_count: number, has_more: boolean }
        if (mounted) setPetitions(data.petitions || data);
      } catch (error) {
        console.error("Failed to fetch petitions", error);
        toast({
          title: "Error",
          description: "Failed to load your petitions. Please try again.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial load
    fetchPetitions();

    // Get user ID for WebSocket connection
    const uid = user?.userId;
    console.log("User ID for WebSocket:", uid);
    
    // per-user WS (preferred)
    if (uid) {
      try {
        wsUser = new WebSocket(`ws://localhost:8000/ws/petitions/my/${uid}`);
        wsUser.onopen = () => console.log("✅ User WS open", uid);
        wsUser.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            console.log("📨 User WS message received:", payload);
            
            // If server sends full petitions list, replace; otherwise react to type:update by refetch
            if (Array.isArray(payload)) {
              console.log("🔄 Updating petitions from array payload");
              setPetitions(payload);
            } else if (payload?.type === 'update' && Array.isArray(payload.petitions)) {
              console.log("🔄 Updating petitions from update message");
              setPetitions(payload.petitions);
            } else if (payload?.type === 'update') {
              console.log("🔄 Refetching petitions");
              fetchPetitions();
            }
          } catch (e) {
            console.error("User WS parse error", e);
          }
        };
        wsUser.onerror = (e) => console.warn("⚠️ User WS error", e);
        wsUser.onclose = () => console.log("🔌 User WS closed");
      } catch (e) {
        console.warn("⚠️ User WS connect failed", e);
      }
    }

    // global WS fallback
    try {
      wsGlobal = new WebSocket(`ws://localhost:8000/ws/petitions`);
      wsGlobal.onopen = () => console.log("✅ Global WS open");
      wsGlobal.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          console.log("📨 Global WS message received:", payload);
          
          if (Array.isArray(payload)) {
            console.log("🔄 Updating petitions from array payload");
            setPetitions(payload);
          } else if (payload?.type === 'update' && Array.isArray(payload.petitions)) {
            console.log("🔄 Updating petitions from update message");
            setPetitions(payload.petitions);
          } else if (payload?.type === 'update') {
            console.log("🔄 Refetching petitions");
            fetchPetitions();
          }
        } catch (e) {
          console.error("Global WS parse error", e);
        }
      };
      wsGlobal.onerror = (e) => console.warn("⚠️ Global WS error", e);
      wsGlobal.onclose = () => console.log("🔌 Global WS closed");
    } catch (e) {
      console.warn("⚠️ Global WS connect failed", e);
    }

    return () => {
      mounted = false;
      try { wsUser?.close(); } catch {}
      try { wsGlobal?.close(); } catch {}
      wsUser = wsGlobal = null;
    };
  }, [user?.token, user, toast]);
  
  // Filter petitions based on active tab and search query
  const filteredPetitions = petitions.filter(petition => {
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
  const submittedCount = petitions.filter(p => p.status === 'submitted').length;
  const inProgressCount = petitions.filter(p => p.status === 'in_progress').length;
  const resolvedCount = petitions.filter(p => p.status === 'resolved').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your petitions...</p>
        </div>
      </div>
    );
  }
  
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 md:mb-0">
            <div className='flex'>
              <TabsList>
                <TabsTrigger value="all">
                  All ({petitions.length})
                </TabsTrigger>
                <TabsTrigger value="submitted">
                  Submitted ({submittedCount})
                </TabsTrigger>
                <TabsTrigger value="in_progress">
                  In Progress ({inProgressCount})
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved ({resolvedCount})
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

            {filteredPetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPetitions.map(petition => (
                  <Card key={petition.petition_id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                    <CardContent className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                          {STATUS_DISPLAY[petition.status as keyof typeof STATUS_DISPLAY] || petition.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(petition.submitted_at)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">
                        <Link to={`/petitions/${petition.petition_id}`} className="hover:text-primary-blue transition-colors">
                          {petition.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {petition.short_description}
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
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-primary-blue border-primary-blue hover:bg-blue-50"
                            onClick={() => navigate(`/petitions/${petition.petition_id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Link to={`/petitions/${petition.petition_id}`}>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-primary-blue border-primary-blue hover:bg-blue-50"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyPetitionsPage;
