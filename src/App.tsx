import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { validateEnv } from "./lib/env";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Terms from './pages/Terms';
import Footer from './pages/Footer';
import Contact from './pages/Contact';

const queryClient = new QueryClient();

// Validate environment variables on app startup
validateEnv();


const AppLayout = () => {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/interview');
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/:id" 
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback/:id" 
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } 
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
