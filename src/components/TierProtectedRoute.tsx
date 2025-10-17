import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export const TierProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  // 🔐 If not logged in → send to login
  if (!user) return <Navigate to="/login" replace />;

  // ✅ DEV BYPASS — Sarah always has access in dev
  if (user.email === "sarahrichardson@Sarahs-MacBook-Pro" || role === "admin") {
    return children;
  }

  // ✅ Allowed roles (normal logic)
  if (["pro", "premium", "admin"].includes(role)) {
    return children;
  }

  // ❌ Everyone else → Upgrade Page
  return <Navigate to="/upgrade" replace />;
};

