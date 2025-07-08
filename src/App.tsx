import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./components/Login";
import ProtectedRoute from "./Routes/ProtectedRoute";
import PublicRoute from "./Routes/PublicRoute";
import { ClientManagement } from "./components/ClientManagement";
import { JobProfileForm } from "./components/JobProfileForm";
import { JobProfiles } from "./components/JobProfiles";
import { Analytics } from "./components/Analytics";
import { Dashboard } from "./components/Dashboard";
// import {ProtectedRoute} from '../src/Routes/ProtectedRoute'

const queryClient = new QueryClient();

const App = () => {
  //  const navigate = useNavigate();
  const handleLogin = () => {
    console.log("Login successful! Redirecting...");
    //  navigate("/");
    alert("Redirect to dashboard");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* public routes  */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Login onLogin={handleLogin} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
            </Route>

            {/* protected route  */}

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<ClientManagement />} />
                <Route path="jobs" element={<JobProfiles />}>
                  <Route index element={<JobProfiles />} />
                  <Route path="create" element={<JobProfileForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                  <Route path="edit/:id" element={<JobProfileForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                </Route>
                <Route path="analytics" element={<Analytics />} />
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
