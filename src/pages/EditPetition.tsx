import React, { useState, useEffect, useContext } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";

// Define the form schema with Zod
const petitionFormSchema = z.object({
  title: z.string()
    .min(10, { message: "Title must be at least 10 characters long" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  short_description: z.string()
    .min(20, { message: "Summary must be at least 20 characters long" })
    .max(300, { message: "Summary must not exceed 300 characters" }),
  description: z.string()
    .min(100, { message: "Description must be at least 100 characters long" }),
  location: z.string().optional(),
});

type PetitionFormValues = z.infer<typeof petitionFormSchema>;

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

export default function EditPetition() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);

  // Initialize the form
  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionFormSchema),
    defaultValues: {
      title: "",
      short_description: "",
      description: "",
      location: "",
    },
  });

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        setLoading(true);
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
        setExistingFiles(data.proof_files || []);
        
        // Set form values
        form.reset({
          title: data.title,
          short_description: data.short_description,
          description: data.description,
          location: data.location || '',
        });
      } catch (error) {
        console.error("Error fetching petition:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load petition details",
          variant: "destructive",
        });
        navigate(`/petitions/${id}`);
      } finally {
        setLoading(false);
      }
    };

    if (id && user?.token) {
      fetchPetition();
    }
  }, [id, navigate, toast, user?.token, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingFile = (fileToRemove: string) => {
    setExistingFiles(prev => prev.filter(file => file !== fileToRemove));
    setRemovedFiles(prev => [...prev, fileToRemove]);
  };

  const onSubmit = async (data: PetitionFormValues) => {
    if (!petition) return;

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('short_description', data.short_description);
      formDataToSend.append('description', data.description);
      if (data.location) {
        formDataToSend.append('location', data.location);
      }

      // Add new files
      newFiles.forEach(file => {
        formDataToSend.append('proof_files', file);
      });

      // Add remaining existing files
      existingFiles.forEach(file => {
        formDataToSend.append('existing_files', file);
      });

      // Add removed files
      removedFiles.forEach(file => {
        formDataToSend.append('removed_files', file);
      });

      const response = await fetch(`http://localhost:8000/petitions/${id}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to update petition');
      }

      toast({
        title: "Success",
        description: "Petition updated successfully",
      });

      navigate(`/petitions/${id}`);
    } catch (error) {
      console.error("Error updating petition:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update petition",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading petition details...</p>
        </div>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Petition not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/petitions/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Petition
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Petition</h1>
        <p className="text-muted-foreground mt-2">
          Update your petition details and keep your supporters informed
        </p>
      </div>

      <Alert className="bg-amber-50 border border-amber-200 mb-6">
        <AlertTriangle className="h-4 w-4 text-amber-800" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Note:</strong> Significant changes to your petition may affect how people perceive it. 
          Updates are visible to everyone who has signed.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Petition Details</TabsTrigger>
              <TabsTrigger value="evidence">Evidence & Proof</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the core details of your petition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Petition Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, specific title will help attract supporters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief summary of your petition's main goal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter location (optional)" />
                        </FormControl>
                        <FormDescription>
                          Where is this issue occurring?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Description</CardTitle>
                  <CardDescription>
                    Provide more information about your petition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[200px]" />
                        </FormControl>
                        <FormDescription>
                          Explain the issue in detail and what changes you want to see
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evidence & Proof</CardTitle>
                  <CardDescription>
                    Add or remove supporting documents and images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {existingFiles.length > 0 && (
                    <div>
                      <FormLabel>Existing Proof Files</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {existingFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`http://localhost:8000/uploads/${file}`}
                              alt={`Proof file ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingFile(file)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormItem>
                    <FormLabel>Add New Proof Files</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      You can select multiple files. Maximum file size: 5MB each.
                    </FormDescription>
                  </FormItem>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/petitions/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary-blue hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 