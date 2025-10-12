// src/contexts/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
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

  const handleRedirect = (path: string) => {
    if (didRedirect.current) return;
    didRedirect.current = true;
    navigate(path, { replace: true });
    setTimeout(() => (didRedirect.current = false), 500);
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();

      // If session expired or missing, log out safely
      if (!data.session) {
        await supabase.auth.signOut();
        setSession(null);
        setLoading(false);
        if (location.pathname.startsWith("/dashboard")) handleRedirect("/");
        return;
      }

      setSession(data.session);
      setLoading(false);

      // Already logged in but on login/signup → go dashboard
      if (
        ["/login", "/signup", "/reset-password"].includes(location.pathname)
      ) {
        handleRedirect("/dashboard");
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(false);

        if (session) {
          // Login → dashboard
          if (
            ["/login", "/signup", "/reset-password", "/"].includes(
              location.pathname
            )
          ) {
            handleRedirect("/dashboard");
          }
        } else {
          // Logout → landing
          handleRedirect("/");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    handleRedirect("/");
  };

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};


