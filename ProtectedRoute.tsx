import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Props = {
  children: React.ReactNode;
  requireOnboarding?: boolean;
};

export default function ProtectedRoute({ children, requireOnboarding }: Props) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) check session
        const { data: sessionRes, error: sErr } = await supabase.auth.getSession();
        if (sErr) throw sErr;
        const session = sessionRes.session;
        if (!session) {
          if (mounted) {
            setAuthed(false);
            setNeedsOnboarding(false);
            setLoading(false);
          }
          return;
        }
        // 2) optionally check onboarding
        if (requireOnboarding) {
          const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .maybeSingle();
          if (pErr) {
            console.warn("[ProtectedRoute] profile check error:", pErr);
          }
          const incomplete = !profile?.onboarding_completed;

          if (mounted) {
            setAuthed(true);
            setNeedsOnboarding(incomplete);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setAuthed(true);
            setNeedsOnboarding(false);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("[ProtectedRoute] error:", e);
        if (mounted) {
          setAuthed(false);
          setNeedsOnboarding(false);
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [requireOnboarding]);

  // Visible loading fallback instead of a white screen
  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireOnboarding && needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
