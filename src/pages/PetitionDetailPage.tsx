
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Share, ThumbsUp, MessageSquare, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock petition data
const MOCK_PETITION = {
  id: '1',
  title: 'Fix the pothole on Main Street',
  shortDescription: 'The large pothole on Main Street has been causing traffic issues and damage to vehicles.',
  longDescription: `
    For the past three months, there has been a large pothole on Main Street near the intersection with Oak Avenue. This pothole has grown to approximately 2 feet wide and 6 inches deep, causing significant traffic issues and damage to vehicles.

    Multiple accidents have been reported when drivers swerve to avoid the pothole, and several car owners have reported damage to their tires and wheel alignment after driving through it. The pothole fills with water during rain, making it difficult to gauge its depth and further increasing the hazard.

    We request the Municipal Corporation to:
    1. Fill and properly repair this pothole with high-quality materials
    2. Investigate why this section of road deteriorated so quickly
    3. Implement better road maintenance protocols to prevent similar issues in the future

    The safety of our community depends on well-maintained roads. Prompt action on this issue will prevent further accidents and vehicle damage.
  `,
  category: 'Infrastructure',
  status: 'In Progress',
  signatureCount: 156,
  signatureGoal: 500,
  createdAt: '2025-04-15T10:30:00Z',
  createdBy: {
    id: 'user-1',
    name: 'Arun Kumar',
    photo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
  },
  location: '19.0760° N, 72.8777° E',
  locationName: 'Main Street & Oak Avenue',
  media: [
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc',
    'https://images.unsplash.com/photo-1597771662979-a48cca7a2103',
  ],
  updates: [
    {
      id: 'update-1',
      date: '2025-04-20T14:15:00Z',
      title: 'Petition Review Completed',
      content: 'Your petition has been reviewed and accepted by the Municipal Corporation. It has been assigned to the Roads Department for further action.',
      status: 'In Review',
    },
    {
      id: 'update-2',
      date: '2025-04-25T09:45:00Z',
      title: 'Scheduled for Inspection',
      content: 'A road inspector has been scheduled to assess the pothole on April 30th. We will provide an update after the inspection.',
      status: 'In Progress',
    },
  ],
  comments: [
    {
      id: 'comment-1',
      user: {
        id: 'user-2',
        name: 'Priya Sharma',
        photo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      },
      date: '2025-04-16T11:20:00Z',
      content: 'I damaged my car tire last week because of this pothole. This needs urgent attention!',
      likes: 12,
    },
    {
      id: 'comment-2',
      user: {
        id: 'user-3',
        name: 'Rahul Singh',
        photo: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
      },
      date: '2025-04-17T15:45:00Z',
      content: 'I live nearby and have seen multiple near-accidents because of people swerving to avoid this pothole. Hope it gets fixed soon.',
      likes: 8,
    },
  ],
  relatedPetitions: [
    {
      id: '2',
      title: 'Repair damaged road signs on Main Street',
      signatureCount: 87,
      category: 'Infrastructure',
    },
    {
      id: '3',
      title: 'Install traffic light at Main Street and Elm Road intersection',
      signatureCount: 245,
      category: 'Safety',
    },
  ],
  recentSigners: [
    {
      id: 'user-4',
      name: 'Anita Desai',
      photo: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      date: '2025-04-25T16:30:00Z',
    },
    {
      id: 'user-5',
      name: 'Vikram Mehta',
      photo: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
      date: '2025-04-25T14:15:00Z',
    },
    {
      id: 'user-6',
      name: 'Sonia Gupta',
      photo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      date: '2025-04-25T10:45:00Z',
    }
  ]
};

// Status badge colors
const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Review': 'bg-purple-100 text-purple-800 border-purple-200',
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

// Calculate time ago
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

const PetitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState('');
  const [hasSigned, setHasSigned] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"petition" | "updates">("petition");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const petition = MOCK_PETITION; // In a real app, we would fetch the petition by ID
  
  const handleSignPetition = () => {
    setHasSigned(true);
    
    toast({
      title: "Thank you for your support!",
      description: "You have successfully signed this petition.",
    });
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (comment.trim()) {
      toast({
        title: "Comment added",
        description: "Your comment has been added to this petition.",
      });
      
      setComment('');
    }
  };
  
  const handleLikeComment = (commentId: string) => {
    const newLikedComments = new Set(likedComments);
    
    if (newLikedComments.has(commentId)) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    
    setLikedComments(newLikedComments);
  };
  
  const handleShare = () => {
    // In a real app, we would implement social sharing
    toast({
      title: "Share link copied",
      description: "The petition link has been copied to your clipboard.",
    });
  };
  
  const calculateProgress = () => {
    return (petition.signatureCount / petition.signatureGoal) * 100;
  };
  
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
                    onClick={handleShare}
                    className="border-primary-blue text-primary-blue"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {!hasSigned && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSignPetition}
                      className="bg-primary-blue hover:bg-blue-600"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Sign Petition
                    </Button>
                  )}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{petition.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-6">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {formatDate(petition.createdAt)}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Created by {petition.createdBy.name}
                  </span>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "petition" | "updates")}>
                <TabsList className="mb-6">
                  <TabsTrigger value="petition">Petition</TabsTrigger>
                  <TabsTrigger value="updates">Updates {petition.updates.length > 0 && `(${petition.updates.length})`}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="petition" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {petition.longDescription}
                    </p>
                  </div>
                  
                  {petition.location && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Location</h2>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-700">{petition.locationName}</span>
                      </div>
                      {/* In a real application, we could integrate Google Maps here */}
                      <div className="mt-3 bg-gray-100 h-48 rounded-md flex items-center justify-center">
                        <p className="text-gray-500">Map preview would appear here</p>
                      </div>
                    </div>
                  )}
                  
                  {petition.media && petition.media.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Supporting Media</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {petition.media.map((imageUrl, index) => (
                          <div 
                            key={index}
                            className="cursor-pointer rounded-md overflow-hidden aspect-video"
                            onClick={() => setSelectedImage(imageUrl)}
                          >
                            <img 
                              src={imageUrl} 
                              alt={`Supporting image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Image preview modal */}
                  {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                      <div className="max-w-4xl max-h-full relative" onClick={e => e.stopPropagation()}>
                        <img 
                          src={selectedImage} 
                          alt="Preview" 
                          className="max-w-full max-h-[80vh] object-contain"
                        />
                        <button 
                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2"
                          onClick={() => setSelectedImage(null)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Comments ({petition.comments.length})</h2>
                    
                    {/* Comment form */}
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your comment..."
                        className="w-full p-3 border border-blue-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent min-h-[100px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          type="submit" 
                          disabled={!comment.trim()}
                          className="bg-primary-blue hover:bg-blue-600"
                        >
                          Post Comment
                        </Button>
                      </div>
                    </form>
                    
                    {/* Comments list */}
                    <div className="space-y-4">
                      {petition.comments.map(comment => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-start mb-3">
                            <img
                              src={comment.user.photo}
                              alt={comment.user.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{comment.user.name}</h4>
                              <p className="text-xs text-gray-500">{timeAgo(comment.date)}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{comment.content}</p>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center text-sm ${
                                likedComments.has(comment.id) ? 'text-primary-blue' : 'text-gray-500'
                              } hover:text-primary-blue transition-colors`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>
                                {likedComments.has(comment.id) ? comment.likes + 1 : comment.likes} 
                                {comment.likes === 1 ? ' Like' : ' Likes'}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="updates" className="space-y-6">
                  {petition.updates.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      {petition.updates.map((update, index) => (
                        <div key={update.id} className="relative pl-10 pb-8">
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold text-lg">{update.title}</h3>
                              <Badge className={`${STATUS_COLORS[update.status as keyof typeof STATUS_COLORS]} font-normal`}>
                                {update.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDate(update.date)}
                            </p>
                            <p className="text-gray-700">
                              {update.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h3>
                      <p className="text-gray-600 text-center">
                        There are no updates on this petition yet. Check back later for progress updates.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right Column - Signature count, recent signers, related petitions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Signature Progress */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Signatures</h2>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{petition.signatureCount} signatures</span>
                  <span className="text-gray-600">Goal: {petition.signatureGoal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-blue h-2.5 rounded-full" 
                    style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {Math.max(0, petition.signatureGoal - petition.signatureCount)} more signatures needed
              </p>
              
              {!hasSigned ? (
                <Button
                  onClick={handleSignPetition}
                  className="w-full bg-primary-blue hover:bg-blue-600"
                >
                  Sign this petition
                </Button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700 text-sm">You've signed this petition</p>
                </div>
              )}
            </Card>
            
            {/* Recent Signers */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Signers</h2>
              <div className="space-y-4">
                {petition.recentSigners.map(signer => (
                  <div key={signer.id} className="flex items-center">
                    <img
                      src={signer.photo}
                      alt={signer.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{signer.name}</p>
                      <p className="text-xs text-gray-500">{timeAgo(signer.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Related Petitions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Related Petitions</h2>
              <div className="space-y-4">
                {petition.relatedPetitions.map(related => (
                  <div key={related.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-medium mb-1">
                      <a href={`/petitions/${related.id}`} className="hover:text-primary-blue transition-colors">
                        {related.title}
                      </a>
                    </h3>
                    <div className="flex justify-between text-sm">
                      <Badge variant="outline" className="bg-blue-50">
                        {related.category}
                      </Badge>
                      <span className="text-gray-600">
                        {related.signatureCount} signatures
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetailPage;
