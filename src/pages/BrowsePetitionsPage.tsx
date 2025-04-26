
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// Mock data for petitions
const MOCK_PETITIONS = [
  {
    id: '1',
    title: 'Fix the pothole on Main Street',
    description: 'The large pothole on Main Street has been causing traffic issues and damage to vehicles.',
    category: 'Infrastructure',
    status: 'Pending',
    signatureCount: 156,
    createdAt: '2025-04-15',
    createdBy: 'Arun Kumar'
  },
  {
    id: '2',
    title: 'Install streetlights in Park Colony',
    description: 'Park Colony needs proper streetlights for safety at night. There have been several incidents of theft.',
    category: 'Safety',
    status: 'In Progress',
    signatureCount: 432,
    createdAt: '2025-04-10',
    createdBy: 'Priya Sharma'
  },
  {
    id: '3',
    title: 'Clean the Ganges river bank',
    description: 'The river bank near the temple has accumulated trash and needs immediate attention.',
    category: 'Environment',
    status: 'Completed',
    signatureCount: 892,
    createdAt: '2025-03-28',
    createdBy: 'Rahul Singh'
  },
  {
    id: '4',
    title: 'Improve bus service frequency',
    description: 'Request to increase bus frequency during peak hours to reduce overcrowding.',
    category: 'Transportation',
    status: 'Pending',
    signatureCount: 257,
    createdAt: '2025-04-02',
    createdBy: 'Deepa Patel'
  },
  {
    id: '5',
    title: 'Repair playground equipment',
    description: 'The swings and slides at Community Park are damaged and pose safety risks to children.',
    category: 'Recreation',
    status: 'In Progress',
    signatureCount: 124,
    createdAt: '2025-04-08',
    createdBy: 'Mohammed Khan'
  },
  {
    id: '6',
    title: 'Request for free health camp',
    description: 'Organizing a free health check-up camp in the underserved area of East Village.',
    category: 'Healthcare',
    status: 'Pending',
    signatureCount: 368,
    createdAt: '2025-04-12',
    createdBy: 'Dr. Vijay Reddy'
  }
];

// Define status badge colors
const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200'
};

// Define categories
const CATEGORIES = [
  'Infrastructure',
  'Transportation',
  'Healthcare',
  'Education',
  'Environment',
  'Safety',
  'Recreation',
  'Others'
];

const BrowsePetitionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Pending', 'In Progress', 'Completed']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Number of petitions per page
  const itemsPerPage = 6;
  
  // Filter and sort petitions
  const filteredPetitions = MOCK_PETITIONS.filter(petition => {
    // Search filter
    const matchesSearch = petition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          petition.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(petition.status);
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(petition.category);
    
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    // Sort by selected option
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'most-signatures') {
      return b.signatureCount - a.signatureCount;
    }
    return 0;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredPetitions.length / itemsPerPage);
  const currentPetitions = filteredPetitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
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
  
  // Handle category filter change
  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Petitions</h1>
        
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
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              {/* Status Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Status</h3>
                <div className="space-y-2">
                  {['Pending', 'In Progress', 'Completed', 'Rejected'].map(status => (
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
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <div key={category} className="flex items-center">
                      <Checkbox 
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategoryFilter(category)}
                      />
                      <label 
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search & Sort */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-grow">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search petitions..."
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
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-signatures">Most Signatures</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredPetitions.length} results
            </p>
            
            {/* Petition Cards */}
            {filteredPetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {currentPetitions.map(petition => (
                  <Card key={petition.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                    <CardContent className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                          {petition.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {petition.createdAt}
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
                    
                    <CardFooter className="border-t bg-gray-50 p-4">
                      <div className="w-full flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created by: {petition.createdBy}
                        </span>
                        <Button 
                          as={Link} 
                          to={`/petitions/${petition.id}`}
                          variant="outline"
                          size="sm"
                          className="text-primary-blue border-primary-blue hover:bg-blue-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No petitions found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatuses(['Pending', 'In Progress', 'Completed']);
                    setSelectedCategories([]);
                  }}
                  variant="outline"
                  className="border-primary-blue text-primary-blue hover:bg-blue-50"
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {filteredPetitions.length > itemsPerPage && (
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
