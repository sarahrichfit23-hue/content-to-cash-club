import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Checkout from './pages/Checkout'; // Adjust path if needed

import { AuthProvider } from "@/contexts/AuthProvider";
import { AppProvider } from "@/contexts/AppContext";

import Dashboard from "@/components/Dashboard";
import MealPlans from "@/pages/MealPlans";
import MealPlanAssistant from "@/pages/MealPlanAssistant"; // ✅ NEW
import Login from "@/components/auth/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TierProtectedRoute } from "@/components/TierProtectedRoute";
import Upgrade from "@/pages/Upgrade";
import ClientHomepage from "./components/coaching/ClientHomepage";
import ClientPortalView from "./components/coaching/ClientPortalView";
import PageEditor from "./components/coaching/PageEditor";
import ClientPortalLogin from "./pages/ClientPortalLogin";
import ClientPortalAcceptInvite from "./pages/ClientPortalAcceptInvite";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminRoute from "./components/admin/AdminRoute";
import AdminPanel from "./pages/AdminPanel";


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
              {/* 🔓 Public */}
              <Route path="/login" element={<Login />} />

              {/* 🧠 Main Dashboard */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 🧾 Meal Plans (legacy) — requires Pro/Premium/Admin */}
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

              {/* ⚡ NEW: AI Meal Plan Generator Assistant */}
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

                  {/* 💳 Checkout Page */}
              <Route 
              path="/checkout" 
              element={
              <Checkout />} 
              />

              {/* Coaching routes */}
              <Route path="/coaching/clients" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <ClientHomepage />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/coaching/portal/:clientId" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <ClientPortalView />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/coaching/page/:pageId" element={
                <ErrorBoundary>
                  <ProtectedRoute requireOnboarding>
                    <PageEditor />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              {/* Client Portal Protected Route */}
              <Route path="/client-portal" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ClientPortalView isClientView />
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
            
              {/* 🚫 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
