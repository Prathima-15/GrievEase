
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// API Types
interface Petition {
  petition_id: number;
  title: string;
  description: string;
  short_description: string;
  category: string;
  department: string;
  status: string;
  urgency_level: string;
  location: string;
  submitted_at: string;
  created_by: string;
  signature_count: number;
}

interface BrowseResponse {
  petitions: Petition[];
  total_count: number;
  has_more: boolean;
}

// Note: Category/Department types removed as page no longer fetches them

// Define status badge colors
const STATUS_COLORS = {
  'submitted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
  'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'escalated': 'bg-orange-100 text-orange-800 border-orange-200'
};

// Map backend status to display text
const STATUS_DISPLAY: Record<string, string> = {
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'in_progress': 'In Progress',
  'resolved': 'Resolved',
  'rejected': 'Rejected',
  'escalated': 'Escalated'
};

// All possible statuses
const ALL_STATUSES = ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected', 'escalated'];

const BrowsePetitionsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // State
  const [petitions, setPetitions] = useState<Petition[]>([]);
  // Categories/Departments removed per request
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['submitted', 'under_review', 'in_progress']);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Number of petitions per page
  const itemsPerPage = 6;
  
  // Fetch petitions when filters change
  useEffect(() => {
    fetchPetitions();
  }, [searchQuery, sortBy, selectedStatuses, currentPage]);
  
  const fetchPetitions = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort_by', sortBy);
      
      // Add status filters
      if (selectedStatuses.length > 0) {
        // Backend expects single status, so we'll fetch all and filter client-side
        // Or we can make multiple requests - for now, let's filter client-side
      }
      
      // Category/Department filters removed per request
      
      params.append('skip', String((currentPage - 1) * itemsPerPage));
      params.append('limit', String(itemsPerPage));
      
      const response = await fetch(`http://localhost:8000/public/petitions?${params.toString()}` , {
        headers: {
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          Accept: 'application/json'
        }
      });
      
      if (!response.ok) {
        // Surface specific 401 to help diagnose
        if (response.status === 401) {
          throw new Error('Unauthorized (401)');
        }
        throw new Error('Failed to fetch petitions');
      }
      
      const data: BrowseResponse = await response.json();
      
      // Client-side filtering for multiple statuses
      let filteredPetitions = data.petitions;
      if (selectedStatuses.length > 0) {
        filteredPetitions = filteredPetitions.filter(p => 
          selectedStatuses.includes(p.status)
        );
      }
      
      // Category/Department client-side filters removed
      
      setPetitions(filteredPetitions);
      setTotalCount(data.total_count);
      
    } catch (error: any) {
      console.error('Error fetching petitions:', error);
      const description = error?.message === 'Unauthorized (401)'
        ? 'Backend responded 401. Ensure enhanced_main.py is running and /petitions/browse is available (public).'
        : 'Failed to load petitions. Please try again.';
      toast({
        title: "Error",
        description,
        variant: "destructive"
      });
      // Avoid spinner hang and show empty state
      setPetitions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Handle filter toggling on mobile
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Handle status filter change
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setCurrentPage(1);
  };
  
  // Category/Department filters removed
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('browse.title')}</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <Button 
              onClick={toggleFilter}
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <Filter size={16} />
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {/* Left Sidebar - Filters */}
          <div className={`lg:w-1/4 ${isFilterOpen || window.innerWidth >= 1024 ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">{t('browse.filters')}</h2>
              
              {/* Status Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">{t('browse.status')}</h3>
                <div className="space-y-2">
                  {ALL_STATUSES.map(status => (
                    <div key={status} className="flex items-center">
                      <Checkbox 
                        id={`status-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      />
                      <label 
                        htmlFor={`status-${status}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {STATUS_DISPLAY[status]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category & Department filters intentionally removed per request */}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search & Sort */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="rounded-md border border-blue-border  flex-grow">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('browse.searchPlaceholder')}
                    className="w-full pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </form>
              
              <div className="md:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-blue-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="newest">{t('browse.newest')}</option>
                  <option value="oldest">{t('browse.oldest')}</option>
                  <option value="most-signatures">{t('browse.mostSignatures')}</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-4">
              {loading ? t('common.loading') : `Showing ${petitions.length} of ${totalCount} results`}
            </p>
            
            {/* Petition Cards */}
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">{t('browse.loading')}</p>
              </div>
            ) : petitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {petitions.map(petition => (
                  <Card key={petition.petition_id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                    <CardContent className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                          {STATUS_DISPLAY[petition.status]}
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
                        {petition.description || petition.short_description}
                      </p>
                      
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-blue-50">
                            {petition.category}
                          </Badge>
                          {petition.department && (
                            <Badge variant="outline" className="bg-purple-50">
                              {petition.department}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          <strong>{petition.signature_count}</strong> signatures
                        </span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 p-4">
                      <div className="w-full flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          By: {petition.created_by}
                        </span>
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
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('browse.noPetitions')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('browse.tryAdjusting')}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatuses(['submitted', 'under_review', 'in_progress']);
                  }}
                  variant="outline"
                  className="border-primary-blue text-primary-blue hover:bg-blue-50"
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {totalCount > itemsPerPage && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === page
                          ? "bg-primary-blue hover:bg-blue-600"
                          : "text-gray-600 hover:text-primary-blue"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePetitionsPage;
