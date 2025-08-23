import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import BrowsePetitionsPage from "./pages/BrowsePetitionsPage";
import PetitionDetailPage from "./pages/PetitionDetailPage";
import PetitionCreatePage from "./components/PetitionForm/PetitionCreatePage";
import MyPetitionsPage from "./pages/MyPetitionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import EditPetition from "./pages/EditPetition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/petitions" element={<BrowsePetitionsPage />} />
              <Route path="/petitions/:id" element={<PetitionDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Protected routes for all authenticated users */}
              <Route path="/petitions/create" element={
                <ProtectedRoute>
                  <PetitionCreatePage />
                </ProtectedRoute>
              } />
              
              <Route path="/petitions/my-petitions" element={
                <ProtectedRoute>
                  <MyPetitionsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/petitions/:id/edit" element={
                <ProtectedRoute>
                  <EditPetition />
                </ProtectedRoute>
              } />
              
              {/* Admin-only routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Auth routes (no layout) */}
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/admin/signin" element={<SignInPage isAdmin={true} />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
