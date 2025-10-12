// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { useAuth } from "./contexts/AuthProvider"; // ✅ Supabase session handling

// Public pages
import Home from "./pages/Home";
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
import LandingPageBuilder from "./components/landing/LandingPageBuilder";
import AdminRoute from "./components/admin/AdminRoute";
import AdminPanel from "./pages/AdminPanel";
import AutomationDashboard from "./components/automation/AutomationDashboard";
import ClientAcquisitionDashboard from "./pages/dashboard/ClientAcquisitionDashboard";

const queryClient = new QueryClient();

const App = () => {
  // ✅ Get session + loading from AuthProvider
  const { session, loading } = useAuth();

  // ⏳ Prevent routing until Supabase finishes restoring session
  if (loading) return <div className="p-6 text-center">Loading session...</div>;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Routes>
              {/* ---------- Public Routes ---------- */}
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signed-out" element={<SignedOut />} />

              {/* ---------- Auth Callback Routes ---------- */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/update-password" element={<UpdatePassword />} />

              {/* ---------- Protected Routes ---------- */}
              <Route
                path="/dashboard"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <Dashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/dashboard/client-acquisition"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <ClientAcquisitionDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <OnboardingQuiz />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/billing"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <BillingPortal />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/landing-pages"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <LandingPageBuilder />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/automation"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <AutomationDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />

              {/* ---------- Admin Route ---------- */}
              <Route
                path="/admin"
                element={
                  <ErrorBoundary>
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  </ErrorBoundary>
                }
              />

              {/* ---------- 404 Route ---------- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AppProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

