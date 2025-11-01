import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalPetitions: number;
  totalUsers: number;
  resolvedPetitions: number;
  pendingPetitions: number;
  averageResolutionTime: number;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  departmentStats: Array<{ department: string; total: number; resolved: number; pending: number }>;
  monthlyTrends: Array<{ month: string; submitted: number; resolved: number }>;
  urgencyDistribution: Array<{ urgency: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to view this page",
        variant: "destructive",
      });
      return;
    }

    fetchDepartments();
    fetchAnalytics();
  }, [isAdmin, dateRange, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8000/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/admin/analytics?range=${dateRange}&department=${selectedDepartment}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics API Error:', errorText);
        throw new Error(`Analytics API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Analytics data received:', data);
      
      // Transform and structure data for charts
      // Build status distribution from actual status_counts
      const statusDistribution = [];
      const statusColorMap: Record<string, string> = {
        'submitted': '#0088FE',
        'under_review': '#00C49F',
        'in_progress': '#FFBB28',
        'resolved': '#82ca9d',
        'rejected': '#FF8042',
        'escalated': '#8884D8'
      };

      for (const [status, count] of Object.entries(data.status_counts || {})) {
        const numCount = typeof count === 'number' ? count : 0;
        if (numCount > 0) {
          statusDistribution.push({
            status: status.split('_').map((word: string) => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            count: numCount,
            color: statusColorMap[status] || '#8884D8'
          });
        }
      }

      const transformedData: AnalyticsData = {
        totalPetitions: data.total_petitions || 0,
        totalUsers: data.total_users || 0,
        resolvedPetitions: data.resolved_petitions || 0,
        pendingPetitions: data.pending_petitions || 0,
        averageResolutionTime: data.average_resolution_time || 0,
        statusDistribution: statusDistribution,
        departmentStats: data.department_stats || [],
        monthlyTrends: data.monthly_trends || [],
        urgencyDistribution: data.urgency_distribution || [],
        recentActivity: data.recent_activity || []
      };

      setAnalytics(transformedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analytics) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      department: selectedDepartment,
      summary: {
        totalPetitions: analytics.totalPetitions,
        totalUsers: analytics.totalUsers,
        resolvedPetitions: analytics.resolvedPetitions,
        pendingPetitions: analytics.pendingPetitions,
        averageResolutionTime: analytics.averageResolutionTime
      },
      details: analytics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Analytics report has been downloaded",
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to view this page.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-gray-600">Unable to load analytics data.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into petition management</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last3months">Last 3 months</SelectItem>
                <SelectItem value="last6months">Last 6 months</SelectItem>
                <SelectItem value="lastyear">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Petitions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalPetitions}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.resolvedPetitions}</p>
                <p className="text-sm text-green-600">
                  {analytics.totalPetitions > 0 ? 
                    `${Math.round((analytics.resolvedPetitions / analytics.totalPetitions) * 100)}% success rate` : 
                    '0% success rate'
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageResolutionTime}</p>
                <p className="text-sm text-gray-600">days</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
                {analytics.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No petition data available</p>
                      <p className="text-sm text-gray-500 mt-2">Petitions will appear here once submitted</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Urgency Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Urgency Levels</h3>
                {analytics.urgencyDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.urgencyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="urgency" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No urgency data available</p>
                      <p className="text-sm text-gray-500 mt-2">Data will appear once petitions are classified</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
              {analytics.departmentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Petitions" />
                    <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                    <Bar dataKey="pending" fill="#ffc658" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No department data available</p>
                    <p className="text-sm text-gray-500 mt-2">Data will appear once petitions are assigned to departments</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
              {analytics.monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="submitted" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Submitted"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Resolved"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No trend data available</p>
                    <p className="text-sm text-gray-500 mt-2">Historical trends will appear as petitions are created</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'petition_resolved' ? 'bg-green-600' :
                          activity.type === 'petition_updated' ? 'bg-blue-600' :
                          activity.type === 'petition_submitted' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}></div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {activity.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No recent activity to display</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;