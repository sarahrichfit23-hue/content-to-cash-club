import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export const TierProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (role !== "pro" && role !== "premium" && role !== "admin") {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
};

