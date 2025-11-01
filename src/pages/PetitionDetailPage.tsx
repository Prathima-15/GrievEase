import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Share, ThumbsUp, MessageSquare, MapPin, Calendar, User, AlertTriangle, CheckCircle, Edit, Shield, Clock, Upload, FileImage, X } from 'lucide-react';
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
  user_name?: string;
  user_email?: string;
}

interface PetitionUpdate {
  update_id: number;
  update_text: string;
  status: string;
  updated_at: string;
  officer_name: string;
  proof_files: string[];
}

// Status badge colors  
const STATUS_COLORS = {
  'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
  'under_review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in_progress': 'bg-purple-100 text-purple-800 border-purple-200', 
  'resolved': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'escalated': 'bg-orange-100 text-orange-800 border-orange-200'
};

// Map backend status to display status
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
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const PetitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [updates, setUpdates] = useState<PetitionUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  // Status display with translations
  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'submitted': t('petition.submitted'),
      'under_review': t('petition.underReview'),
      'in_progress': t('petition.inProgress'),
      'resolved': t('petition.resolved'),
      'rejected': t('petition.rejected'),
      'escalated': t('petition.escalated')
    };
    return statusMap[status] || status;
  };

  const fetchPetitionUpdates = async () => {
    if (!id) return;
    
    setLoadingUpdates(true);
    try {
      // Use admin endpoint for admins, regular endpoint for users
      const endpoint = isAdmin 
        ? `http://localhost:8000/admin/petitions/${id}/updates`
        : `http://localhost:8000/petitions/${id}/updates`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const updatesData = await response.json();
        setUpdates(updatesData);
      }
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const fetchPetitionData = async () => {
    try {
      // Use admin endpoint if user is admin, otherwise use regular endpoint
      const endpoint = isAdmin 
        ? `http://localhost:8000/admin/petitions`
        : `http://localhost:8000/petitions/${id}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to fetch petition');
      }

      const data = await response.json();
      
      if (isAdmin) {
        // Find the specific petition from admin list
        const foundPetition = data.find((p: any) => p.petition_id === parseInt(id!));
        if (!foundPetition) {
          throw new Error('Petition not found');
        }
        setPetition(foundPetition);
        setNewStatus(foundPetition.status);
      } else {
        setPetition(data);
      }
      
      // Fetch updates for all users (both admin and regular users)
      fetchPetitionUpdates();
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

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user?.token || !id) return;

    let wsUser: WebSocket | null = null;
    let wsGlobal: WebSocket | null = null;
    let mounted = true;

    // Initial fetch
    fetchPetitionData();

    // Get user ID for WebSocket connection
    const uid = user?.userId;
    console.log("🔌 Setting up WebSocket for petition detail page, user ID:", uid);

    // Connect to user-specific WebSocket
    if (uid) {
      try {
        wsUser = new WebSocket(`ws://localhost:8000/ws/petitions/my/${uid}`);
        wsUser.onopen = () => console.log("✅ Petition Detail - User WS open", uid);
        wsUser.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            console.log("📨 Petition Detail - User WS message received:", payload);
            
            // Check if the update is for the current petition
            if (payload?.type === 'update' && Array.isArray(payload.petitions)) {
              const updatedPetition = payload.petitions.find(
                (p: any) => p.petition_id === parseInt(id!)
              );
              
              if (updatedPetition) {
                console.log("🔄 Updating petition details from WebSocket");
                setPetition(prev => prev ? { ...prev, ...updatedPetition } : updatedPetition);
                // Also refresh updates
                fetchPetitionUpdates();
                
                toast({
                  title: t('petition.petitionUpdated'),
                  description: t('petition.petitionUpdatedDesc'),
                });
              }
            }
          } catch (e) {
            console.error("Petition Detail - User WS parse error", e);
          }
        };
        wsUser.onerror = (e) => console.warn("⚠️ Petition Detail - User WS error", e);
        wsUser.onclose = () => console.log("🔌 Petition Detail - User WS closed");
      } catch (e) {
        console.warn("⚠️ Petition Detail - User WS connect failed", e);
      }
    }

    // Connect to global WebSocket as fallback
    try {
      wsGlobal = new WebSocket(`ws://localhost:8000/ws/petitions`);
      wsGlobal.onopen = () => console.log("✅ Petition Detail - Global WS open");
      wsGlobal.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          console.log("📨 Petition Detail - Global WS message received:", payload);
          
          if (payload?.type === 'update' && Array.isArray(payload.petitions)) {
            const updatedPetition = payload.petitions.find(
              (p: any) => p.petition_id === parseInt(id!)
            );
            
            if (updatedPetition) {
              console.log("🔄 Updating petition details from Global WebSocket");
              setPetition(prev => prev ? { ...prev, ...updatedPetition } : updatedPetition);
              fetchPetitionUpdates();
              
              toast({
                title: t('petition.petitionUpdated'),
                description: t('petition.petitionUpdatedDesc'),
              });
            }
          }
        } catch (e) {
          console.error("Petition Detail - Global WS parse error", e);
        }
      };
      wsGlobal.onerror = (e) => console.warn("⚠️ Petition Detail - Global WS error", e);
      wsGlobal.onclose = () => console.log("🔌 Petition Detail - Global WS closed");
    } catch (e) {
      console.warn("⚠️ Petition Detail - Global WS connect failed", e);
    }

    return () => {
      mounted = false;
      try { wsUser?.close(); } catch {}
      try { wsGlobal?.close(); } catch {}
      wsUser = wsGlobal = null;
    };
  }, [id, user?.token, user?.userId, isAdmin, toast]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setProofFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Admin function to update petition status
  const handleUpdateStatus = async () => {
    if (!isAdmin || !petition || !newStatus) return;
    
    // Check if admin comment is provided
    if (!adminComment.trim()) {
      toast({
        title: t('common.error'),
        description: "Admin comment is required for verification",
        variant: "destructive",
      });
      return;
    }
    
    setVerifying(true);
    
    try {
      // Step 1: Verify the update with AI
      const verifyFormData = new FormData();
      verifyFormData.append('admin_comment', adminComment.trim());
      
      // Add proof files for verification
      proofFiles.forEach(file => {
        verifyFormData.append('proof_files', file);
      });

      const verifyResponse = await fetch(`http://localhost:8000/admin/petitions/${petition.petition_id}/verify-update`, {
        method: 'POST',
        body: verifyFormData,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!verifyResponse.ok) {
        throw new Error('Verification failed');
      }

      const verificationResult = await verifyResponse.json();
      
      console.log('🤖 AI Verification Result:', verificationResult);
      
      // Show verification result to admin
      if (!verificationResult.is_valid) {
        // AI determined the update is invalid
        toast({
          title: "❌ Verification Failed",
          description: verificationResult.reason || "The update doesn't seem relevant to this petition",
          variant: "destructive",
        });
        
        // Show suggestions if available
        if (verificationResult.suggestions) {
          setTimeout(() => {
            toast({
              title: "💡 Suggestions",
              description: verificationResult.suggestions,
            });
          }, 2000);
        }
        
        setVerifying(false);
        return; // Stop here - don't submit the update
      }
      
      // AI approved - proceed directly without confirmation
      // Show success toast for AI verification
      if (verificationResult.ai_available) {
        toast({
          title: "✅ AI Verification Passed",
          description: `Confidence: ${verificationResult.confidence}% - ${verificationResult.reason}`,
        });
      }
      
      setVerifying(false);
      setIsUpdating(true);
      
      // Step 2: If verified, proceed with actual update
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('admin_comment', adminComment.trim());

      // Add proof files
      proofFiles.forEach(file => {
        formData.append('proof_files', file);
      });

      const response = await fetch(`http://localhost:8000/admin/petitions/${petition.petition_id}/status`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();

      // Update local state
      setPetition(prev => prev ? { ...prev, status: newStatus } : null);
      setAdminComment('');
      setProofFiles([]);
      
      // Refresh updates
      fetchPetitionUpdates();
      
      toast({
        title: t('petition.statusUpdatedTitle'),
        description: `${t('petition.statusUpdatedDesc')} ${getStatusDisplay(newStatus)}. ${result.files_uploaded} ${t('petition.filesUploaded')}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('common.error'),
        description: t('petition.updateError'),
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">{t('petition.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('petition.errorLoading')}</h2>
          <p className="text-gray-600">{error || t('petition.petitionNotFound')}</p>
          <Button
            onClick={() => navigate('/petitions/my')}
            className="mt-4 bg-primary-blue hover:bg-blue-600"
          >
            {t('petition.back')}
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
                  {getStatusDisplay(petition.status)}
                </Badge>
                <div className="flex space-x-2">
                  {!isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/petitions/${id}/edit`)}
                      className="border-primary-blue text-primary-blue"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('petition.edit')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: t('petition.linkCopied'),
                        description: t('petition.linkCopiedDesc'),
                      });
                    }}
                    className="border-primary-blue text-primary-blue"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    {t('petition.share')}
                  </Button>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">{t('petition.adminActions')}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">{t('petition.updateStatus')}</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder={t('petition.selectNewStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">{t('petition.submitted')}</SelectItem>
                          <SelectItem value="under_review">{t('petition.underReview')}</SelectItem>
                          <SelectItem value="in_progress">{t('petition.inProgress')}</SelectItem>
                          <SelectItem value="resolved">{t('petition.resolved')}</SelectItem>
                          <SelectItem value="rejected">{t('petition.rejected')}</SelectItem>
                          <SelectItem value="escalated">{t('petition.escalated')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">{t('petition.adminComment')}</Label>
                      <Textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder={t('petition.adminCommentPlaceholder')}
                        className="min-h-[100px] mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">{t('petition.uploadProofFiles')}</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          multiple
                          accept="image/*,application/pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="mb-2"
                        />
                        <p className="text-xs text-gray-500 mb-3">
                          {t('petition.uploadProofHelper')}
                        </p>
                        
                        {/* Selected files preview */}
                        {proofFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">{t('petition.selectedFiles')}</p>
                            <div className="flex flex-wrap gap-2">
                              {proofFiles.map((file, index) => (
                                <div key={index} className="flex items-center bg-blue-50 rounded-lg px-3 py-2 text-sm">
                                  <FileImage className="h-4 w-4 mr-2 text-blue-600" />
                                  <span className="max-w-32 truncate">{file.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="ml-2 h-4 w-4 p-0 hover:bg-blue-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleUpdateStatus}
                      disabled={!newStatus || isUpdating || verifying || !adminComment.trim()}
                      className="bg-primary-blue hover:bg-blue-700 w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {verifying 
                        ? '🤖 Verifying with AI...' 
                        : isUpdating 
                        ? t('petition.updating') 
                        : (newStatus === petition.status ? t('petition.addUpdate') : t('petition.updateStatusAndProof'))
                      }
                    </Button>
                  </div>
                </div>
              )}

              <h1 className="text-2xl font-bold mb-4">{petition.title}</h1>
              <p className="text-gray-600 mb-6">{petition.short_description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{petition.location || t('petition.noLocation')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{t('petition.submittedAt')} {formatDate(petition.submitted_at)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{t('petition.urgencyLabel')}: {petition.urgency_level}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>{t('petition.department')}: {petition.department}</span>
                </div>
                {/* Show user info for admins */}
                {isAdmin && petition.user_name && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2" />
                    <span>{t('petition.submittedBy')}: {petition.user_name}</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('petition.detailedDescription')}</h2>
                <p className="whitespace-pre-wrap">{petition.description}</p>
              </div>

              {petition.proof_files && petition.proof_files.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('petition.proofFiles')}</h2>
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
              <h2 className="text-xl font-semibold mb-4">{t('petition.status')}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">{t('petition.category')}</p>
                  <p className="font-medium">{petition.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('petition.dueDate')}</p>
                  <p className="font-medium">{formatDate(petition.due_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('petition.currentStatus')}</p>
                  <Badge className={`${STATUS_COLORS[petition.status as keyof typeof STATUS_COLORS]} font-normal`}>
                    {getStatusDisplay(petition.status)}
                  </Badge>
                </div>
                {isAdmin && petition.user_email && (
                  <div>
                    <p className="text-sm text-gray-600">{t('petition.userEmail')}</p>
                    <p className="font-medium">{petition.user_email}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Updates History - Visible to all users for transparency */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {isAdmin ? t('petition.updatesHistory') : t('petition.statusUpdates')}
              </h2>
              {loadingUpdates ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">{t('petition.loadingUpdates')}</p>
                </div>
              ) : updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.update_id} className="border-l-2 border-blue-200 pl-4 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {getStatusDisplay(update.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(update.updated_at)}
                        </span>
                      </div>
                      {update.update_text && (
                        <p className="text-sm text-gray-700 mb-2">{update.update_text}</p>
                      )}
                      {isAdmin && (
                        <p className="text-xs text-gray-500">By: {update.officer_name}</p>
                      )}
                      
                      {/* Show proof files if any */}
                      {update.proof_files && update.proof_files.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">
                            {isAdmin ? t('petition.attachedFiles') : t('petition.evidence')}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {update.proof_files.map((file, fileIndex) => (
                              <a
                                key={fileIndex}
                                href={`http://localhost:8000/uploads/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-xs"
                              >
                                <FileImage className="h-3 w-3 mr-1" />
                                {file.length > 15 ? `${file.substring(0, 15)}...` : file}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {isAdmin ? t('petition.noUpdatesRecorded') : t('petition.noStatusUpdates')}
                </p>
              )}
            </Card>

            {/* Admin Info Panel - Admin only */}
            {isAdmin && (
              <Card className="p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  <h2 className="text-lg font-semibold">{t('petition.adminView')}</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {t('petition.adminPrivileges')}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{t('petition.lastUpdated')}: {formatDate(petition.submitted_at)}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetailPage;
