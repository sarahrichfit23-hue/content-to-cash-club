import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 💳 Payment + Auth
import Checkout from "./pages/Checkout";
import StripeSuccess from "./pages/StripeSuccess";
import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/SignUp";

// 🧠 App Providers
import { AuthProvider } from "@/contexts/AuthProvider";
import { AppProvider } from "@/contexts/AppContext";

// 🧭 Core Pages
import Dashboard from "@/components/Dashboard";
import Onboarding from "@/pages/Onboarding"; // ✅ Onboarding quiz page
import BrandDNAWizard from "@/components/brand/BrandDNAWizard"; // ✅ Brand DNA editor page

// 🥗 Meal Plans
import MealPlans from "@/pages/MealPlans";
import MealPlanAssistant from "@/pages/MealPlanAssistant";

// 🧩 Routes / Auth Wrappers
import ProtectedRoute from "@/components/ProtectedRoute";
import { TierProtectedRoute } from "@/components/TierProtectedRoute";

// 💳 Upgrade Page
import Upgrade from "@/pages/Upgrade";

// 👩‍🏫 Coaching Pages
import ClientHomepage from "./components/coaching/ClientHomepage";
import ClientPortalView from "./components/coaching/ClientPortalView";
import PageEditor from "./components/coaching/PageEditor";
import ClientPortalLogin from "./pages/ClientPortalLogin";
import ClientPortalAcceptInvite from "./pages/ClientPortalAcceptInvite";

// 🧱 Admin
import AdminRoute from "./components/admin/AdminRoute";
import AdminPanel from "./pages/AdminPanel";

// 🧰 Other
import ErrorBoundary from "@/components/ErrorBoundary";

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 — Not Found</h2>
      <p>That page doesn’t exist.</p>
      <a href="/login" style={{ color: "#2563eb", textDecoration: "underline" }}>
        Go to Login
      </a>
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>

             {/* 🔓 Public Routes */}
             <Route path="/login" 
             element={
               <Login />
             } 
             />

          <Route path="/signup" 
          element={
            <SignUp />
             } 
           />

             <Route path="/success" 
             element={
               <StripeSuccess />
             } 
            />

             {/* Optional: keep only if you still want /checkout to redirect */}
             <Route path="/checkout" 
               element={
                <Checkout />
             } 
           />

              {/* 🧭 Onboarding Flow */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* 🧬 Brand DNA Wizard (Advanced Brand Editor) */}
              <Route
                path="/branddna"
                element={
                  <ProtectedRoute>
                    <BrandDNAWizard />
                  </ProtectedRoute>
                }
              />

              {/* 🧠 Main Dashboard */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 🧾 Meal Plans (Pro/Premium/Admin only) */}
              <Route
                path="/meal-plans"
                element={
                  <ProtectedRoute>
                    <TierProtectedRoute>
                      <MealPlans />
                    </TierProtectedRoute>
                  </ProtectedRoute>
                }
              />

              {/* ⚡ AI Meal Plan Generator Assistant */}
              <Route
                path="/meal-plan-assistant"
                element={
                  <ProtectedRoute>
                    <TierProtectedRoute>
                      <MealPlanAssistant />
                    </TierProtectedRoute>
                  </ProtectedRoute>
                }
              />

              {/* 💳 Upgrade Page */}
              <Route
                path="/upgrade"
                element={
                  <ProtectedRoute>
                    <Upgrade />
                  </ProtectedRoute>
                }
              />

              {/* 👩‍🏫 Coaching Routes */}
              <Route
                path="/coaching/clients"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <ClientHomepage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/coaching/portal/:clientId"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <ClientPortalView />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/coaching/page/:pageId"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requireOnboarding>
                      <PageEditor />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />

              {/* 🧑‍💻 Client Portal */}
              <Route
                path="/client-portal"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ClientPortalView isClientView />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />

              {/* 🛠️ Admin Area */}
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

              {/* 🛠️ Admin Area */}
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

              {/* 🚫 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
