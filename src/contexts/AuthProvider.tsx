// src/contexts/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const didRedirect = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      if (didRedirect.current) return; // ✅ Prevent duplicate navigation
      didRedirect.current = true;

      if (session) {
        // User logged in
        if (location.pathname === "/login" || location.pathname === "/") {
          navigate("/dashboard", { replace: true });
        }
      } else {
        // User logged out
        if (!["/login", "/signup", "/reset-password"].includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      }

      // Reset guard after short delay to allow future logins/logouts
      setTimeout(() => {
        didRedirect.current = false;
      }, 1000);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

