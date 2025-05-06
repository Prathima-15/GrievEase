import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Share, ThumbsUp, MessageSquare, MapPin, Calendar, User, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface Petition {
  petition_id: number;
  title: string;
  short_description: string;
  description: string;
  department: string;
  category: string;
  urgency_level: string;
  location: string | null;
  proof_files: string[];
  status: string;
  submitted_at: string;
  due_date: string;
}

// Status badge colors
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
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const PetitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        const response = await fetch(`http://localhost:8000/petitions/${id}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || 'Failed to fetch petition');
        }

        const data = await response.json();
        setPetition(data);
      } catch (error) {
        console.error("Failed to fetch petition:", error);
        setError(error instanceof Error ? error.message : "Failed to load petition");
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load petition",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.token && id) {
      fetchPetition();
    }
  }, [id, user?.token, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading petition details...</p>
        </div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Petition</h2>
          <p className="text-gray-600">{error || "Petition not found"}</p>
          <Button
            onClick={() => navigate('/petitions/my')}
            className="mt-4 bg-primary-blue hover:bg-blue-600"
          >
            Back to My Petitions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Petition Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal text-base px-3 py-1 mb-4 sm:mb-0`}>
                  {petition.status}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/petitions/${id}/edit`)}
                    className="border-primary-blue text-primary-blue"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied",
                        description: "Petition link has been copied to clipboard",
                      });
                    }}
                    className="border-primary-blue text-primary-blue"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-4">{petition.title}</h1>
              <p className="text-gray-600 mb-6">{petition.short_description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{petition.location || 'No location specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Submitted on {formatDate(petition.submitted_at)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>Urgency: {petition.urgency_level}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Department: {petition.department}</span>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <h2 className="text-xl font-semibold mb-4">Detailed Description</h2>
                <p className="whitespace-pre-wrap">{petition.description}</p>
              </div>

              {petition.proof_files && petition.proof_files.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Proof Files</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {petition.proof_files.map((file, index) => (
                      <a
                        key={index}
                        href={`http://localhost:8000/uploads/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary-blue transition-colors"
                      >
                        <img
                          src={`http://localhost:8000/uploads/${file}`}
                          alt={`Proof file ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status and Updates */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Petition Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{petition.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{formatDate(petition.due_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                    {petition.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetailPage;
