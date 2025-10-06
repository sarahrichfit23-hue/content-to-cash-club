import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignedOut from "./pages/SignedOut";

// Auth pages
import SignUp from "./components/auth/SignUp";
import Login from "./components/auth/Login";
import ResetPassword from "./components/auth/ResetPassword";
import UpdatePassword from "./components/auth/UpdatePassword";
import AuthCallback from "./components/auth/AuthCallback";

// Protected pages
import Dashboard from "./components/Dashboard";
import OnboardingQuiz from "./components/OnboardingQuiz";
import BillingPortal from "./components/BillingPortal";
import ProtectedRoute from "./components/ProtectedRoute";
import { LandingPageBuilder } from "./components/landing/LandingPageBuilder";
import { AdminRoute } from "./components/admin/AdminRoute";
import AdminPanel from "./pages/AdminPanel";
import AutomationDashboard from "./components/automation/AutomationDashboard";


const queryClient = new QueryClient();


const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signed-out" element={<SignedOut />} />
              
              {/* Auth callback routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/update-password" element={<UpdatePassword />} />

              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <Dashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/onboarding" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <OnboardingQuiz />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/billing" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <BillingPortal />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/landing-pages" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <LandingPageBuilder />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/automation" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <AutomationDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              {/* Admin route */}
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                </ErrorBoundary>
              } />

              {/* 404 */}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
