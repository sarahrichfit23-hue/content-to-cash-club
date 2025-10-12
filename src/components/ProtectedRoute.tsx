import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAppContext();
  const navigate = useNavigate();

  // ✅ All hooks must be called before any return statement
  useEffect(() => {
    if (!user && !loading) {
      console.log("🚪 User logged out — forcing redirect to /signed-out");
      navigate("/signed-out", { replace: true });
    }
  }, [user, loading, navigate]);

  // ⏳ Wait until Supabase finishes checking session
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🚫 If user is not logged in → redirect to landing page
  if (!user) {
    console.log("🔒 ProtectedRoute: No user session, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // ✅ Logged-in user → allow access
  return <>{children}</>;
};

export default ProtectedRoute;

