import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Users, 
  Building, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  RefreshCw,
  Shield,
  Clock,
  Bell,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  contact: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  department: string;
  color: string;
  active: boolean;
}

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

const AdminSettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // State for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({});
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  
  // State for system settings
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to view this page",
        variant: "destructive",
      });
      return;
    }

    loadSettings();
  }, [isAdmin]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load departments (mock data)
      setDepartments([
        {
          id: "1",
          name: "Public Works",
          description: "Infrastructure, roads, and public utilities",
          head: "John Smith",
          contact: "john.smith@gov.in",
          active: true
        },
        {
          id: "2", 
          name: "Health Department",
          description: "Public health services and medical facilities",
          head: "Dr. Sarah Johnson",
          contact: "sarah.johnson@gov.in",
          active: true
        },
        {
          id: "3",
          name: "Education",
          description: "Schools, colleges, and educational policies",
          head: "Michael Brown",
          contact: "michael.brown@gov.in",
          active: true
        },
        {
          id: "4",
          name: "Transportation",
          description: "Public transport and traffic management",
          head: "David Wilson", 
          contact: "david.wilson@gov.in",
          active: false
        }
      ]);

      // Load categories (mock data)
      setCategories([
        {
          id: "1",
          name: "Road Maintenance",
          description: "Potholes, street lighting, road repairs",
          department: "Public Works",
          color: "#3B82F6",
          active: true
        },
        {
          id: "2",
          name: "Healthcare Access",
          description: "Hospital services, medical facilities",
          department: "Health Department", 
          color: "#10B981",
          active: true
        },
        {
          id: "3",
          name: "School Infrastructure",
          description: "School buildings, facilities, resources",
          department: "Education",
          color: "#F59E0B",
          active: true
        },
        {
          id: "4",
          name: "Public Transport",
          description: "Bus services, metro, connectivity",
          department: "Transportation",
          color: "#EF4444",
          active: false
        }
      ]);

      // Load system settings (mock data)
      setSystemSettings([
        {
          key: "petition_auto_assign",
          value: "true",
          description: "Automatically assign petitions to departments",
          type: "boolean"
        },
        {
          key: "max_file_size",
          value: "10",
          description: "Maximum file upload size (MB)",
          type: "number"
        },
        {
          key: "email_notifications",
          value: "enabled",
          description: "Email notifications for status updates",
          type: "select",
          options: ["enabled", "disabled", "admin_only"]
        },
        {
          key: "default_urgency",
          value: "medium",
          description: "Default urgency level for new petitions",
          type: "select",
          options: ["low", "medium", "high", "critical"]
        },
        {
          key: "petition_deadline_days",
          value: "30",
          description: "Default deadline for petition resolution (days)",
          type: "number"
        }
      ]);

    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDepartment = async (dept: Partial<Department>) => {
    setSaving(true);
    try {
      if (dept.id) {
        // Update existing department
        setDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, ...dept } : d));
        toast({
          title: "Department Updated",
          description: `${dept.name} has been updated successfully`,
        });
      } else {
        // Add new department
        const newDept: Department = {
          id: Date.now().toString(),
          name: dept.name || '',
          description: dept.description || '',
          head: dept.head || '',
          contact: dept.contact || '',
          active: dept.active !== false
        };
        setDepartments(prev => [...prev, newDept]);
        toast({
          title: "Department Added",
          description: `${dept.name} has been added successfully`,
        });
      }
      setNewDepartment({});
      setEditingDepartment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Department Deleted",
        description: "Department has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const saveCategory = async (cat: Partial<Category>) => {
    setSaving(true);
    try {
      if (cat.id) {
        // Update existing category
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ...cat } : c));
        toast({
          title: "Category Updated",
          description: `${cat.name} has been updated successfully`,
        });
      } else {
        // Add new category
        const newCat: Category = {
          id: Date.now().toString(),
          name: cat.name || '',
          description: cat.description || '',
          department: cat.department || '',
          color: cat.color || '#3B82F6',
          active: cat.active !== false
        };
        setCategories(prev => [...prev, newCat]);
        toast({
          title: "Category Added",
          description: `${cat.name} has been added successfully`,
        });
      }
      setNewCategory({});
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Category Deleted",
        description: "Category has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const updateSystemSetting = async (key: string, value: string) => {
    try {
      setSystemSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      toast({
        title: "Setting Updated",
        description: "System setting has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
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
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
            <p className="text-gray-600">Manage system configuration and organizational structure</p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Admin Panel</span>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Departments</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Department Management</h3>
                <Button 
                  onClick={() => setEditingDepartment('new')}
                  className="bg-primary-blue hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </div>

              {/* Add/Edit Department Form */}
              {editingDepartment && (
                <Card className="p-4 mb-6 border-dashed">
                  <h4 className="font-medium mb-4">
                    {editingDepartment === 'new' ? 'Add New Department' : 'Edit Department'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Department Name</Label>
                      <Input
                        value={newDepartment.name || ''}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter department name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department Head</Label>
                      <Input
                        value={newDepartment.head || ''}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, head: e.target.value }))}
                        placeholder="Enter head of department"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Contact Email</Label>
                      <Input
                        type="email"
                        value={newDepartment.contact || ''}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, contact: e.target.value }))}
                        placeholder="Enter contact email"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newDepartment.description || ''}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter department description"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingDepartment(null);
                        setNewDepartment({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveDepartment(newDepartment)}
                      disabled={saving || !newDepartment.name}
                      className="bg-primary-blue hover:bg-blue-700"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Department
                    </Button>
                  </div>
                </Card>
              )}

              {/* Departments List */}
              <div className="space-y-4">
                {departments.map(dept => (
                  <Card key={dept.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{dept.name}</h4>
                          <Badge variant={dept.active ? "default" : "secondary"}>
                            {dept.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{dept.description}</p>
                        <p className="text-sm text-gray-500">Head: {dept.head} • Contact: {dept.contact}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDepartment(dept.id);
                            setNewDepartment(dept);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Department</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{dept.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteDepartment(dept.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Category Management</h3>
                <Button 
                  onClick={() => setEditingCategory('new')}
                  className="bg-primary-blue hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {/* Add/Edit Category Form */}
              {editingCategory && (
                <Card className="p-4 mb-6 border-dashed">
                  <h4 className="font-medium mb-4">
                    {editingCategory === 'new' ? 'Add New Category' : 'Edit Category'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Category Name</Label>
                      <Input
                        value={newCategory.name || ''}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <Select
                        value={newCategory.department || ''}
                        onValueChange={(value) => setNewCategory(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.filter(d => d.active).map(dept => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Color</Label>
                      <Input
                        type="color"
                        value={newCategory.color || '#3B82F6'}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        className="mt-1 h-10"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter category description"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategory({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveCategory(newCategory)}
                      disabled={saving || !newCategory.name}
                      className="bg-primary-blue hover:bg-blue-700"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Category
                    </Button>
                  </div>
                </Card>
              )}

              {/* Categories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <Card key={cat.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        <h4 className="font-medium">{cat.name}</h4>
                        <Badge variant={cat.active ? "default" : "secondary"}>
                          {cat.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(cat.id);
                            setNewCategory(cat);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{cat.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCategory(cat.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cat.description}</p>
                    <p className="text-xs text-gray-500">Department: {cat.department}</p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">System Configuration</h3>
              <div className="space-y-6">
                {systemSettings.map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="w-48">
                      {setting.type === 'boolean' ? (
                        <Select
                          value={setting.value}
                          onValueChange={(value) => updateSystemSetting(setting.key, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Enabled</SelectItem>
                            <SelectItem value="false">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : setting.type === 'select' && setting.options ? (
                        <Select
                          value={setting.value}
                          onValueChange={(value) => updateSystemSetting(setting.key, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options.map(option => (
                              <SelectItem key={option} value={option}>
                                {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          value={setting.value}
                          onChange={(e) => updateSystemSetting(setting.key, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettingsPage;