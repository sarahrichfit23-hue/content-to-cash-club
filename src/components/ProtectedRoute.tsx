import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState<boolean>(false);
  const [profile, setProfile] = React.useState<any>(null);
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      setIsAuthed(Boolean(session));

      if (session?.user) {
        // Fetch the user's profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("has_paid, onboarding_completed")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      }

      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 🌀 Loading state
  if (loading) return <div style={{ padding: 24 }}>Loading session…</div>;

  // 🔒 1. Not logged in → go to login
  if (!isAuthed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // 💳 2. Logged in but not paid → go to checkout
  if (profile && profile.has_paid === false) {
    return <Navigate to="/checkout" replace />;
  }

  // 🧭 3. Paid but not onboarded → go to onboarding
  if (profile && profile.has_paid && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  // ✅ 4. Paid + onboarded → access granted
  return <>{children}</>;
}
