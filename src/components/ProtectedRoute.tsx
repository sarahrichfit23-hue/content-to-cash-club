import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState<boolean>(false);
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthed(Boolean(data.session));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading session…</div>;

  if (!isAuthed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
