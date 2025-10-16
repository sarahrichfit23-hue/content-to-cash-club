import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/contexts/AuthProvider";
import { AppProvider } from "@/contexts/AppContext";

import Dashboard from "@/components/Dashboard";
import MealPlans from "@/pages/MealPlans";
import Login from "@/components/auth/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TierProtectedRoute } from "@/components/TierProtectedRoute";
import Upgrade from "@/pages/Upgrade";

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
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* App */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Meal Plans — requires Pro/Premium/Admin */}
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

              {/* Upgrade Page (shown to Free users) */}
              <Route
                path="/upgrade"
                element={
                  <ProtectedRoute>
                    <Upgrade />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

