import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Import your existing top-level pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Import your components from src/components
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import {AllFollowUps} from "./components/AllFollowUps";


import ProtectedRoute from "./Routes/ProtectedRoute";
import PublicRoute from "./Routes/PublicRoute";
import Profile from "./components/Profile";
import Invoice from "./pages/Invoice";
import {ProductList} from "./components/BlogList";
import {AddProductPage} from "./pages/AddBlogPage";
import EditBlog from "./components/EditBlog";
import { ClientList } from "./components/ClientList";
import { ClientManagement } from "./components/ClientManagement";
import { ClientForm } from "./components/ClientForm";
import {InvoiceList} from "./pages/InvoiceList";

const queryClient = new QueryClient();

const App = () => {
  const handleLogin = () => {
    console.log("Login successful! Redirecting...");
    alert("Redirect to dashboard");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes (e.g., Login) */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Login onLogin={handleLogin} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
            </Route>

            {/* Protected routes (requiring authentication) */}
            <Route element={<ProtectedRoute />}>
              {/* The Index component likely provides the common layout (Sidebar, Header) */}
              <Route path="/" element={<Index />}>
                {/* Default protected route, redirects to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                {/* new All followup filter */}
               <Route path="allfollowup" element={<AllFollowUps />} />
               <Route path="invoice" element={<Invoice />} />
               <Route path="invoicelist" element={<InvoiceList />} />
               <Route path="invoice/:id" element={<Invoice />} />

                {/* Existing Protected Routes */}
                <Route path="dashboard" element={<Dashboard />} />
             
                 <Route path="profile" element={<Profile />} />

                     <Route path="blog" element={<ClientManagement />} />
                {/* Update this route to use the new AddBlogPage component */}
                <Route path="blog/create" element={<ClientForm />} /> {/* <--- CHANGED THIS LINE */}
                <Route path="blog/edit/:slug" element={<EditBlog />} />
                 
                     <Route path="products" element={<ProductList />} />
                {/* Update this route to use the new AddBlogPage component */}
                <Route path="products/create" element={<AddProductPage />} /> {/* <--- CHANGED THIS LINE */}
                <Route path="blog/edit/:slug" element={<EditBlog />} />
              </Route>

              

              
            </Route>

            {/* Catch-all route for 404 (must be last) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;