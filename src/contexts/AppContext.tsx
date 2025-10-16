// src/contexts/AppContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  full_name?: string | null;
} | null;

type AppCtx = {
  profile: Profile;
  refreshProfile: () => Promise<void>;
};

const AppContext = createContext<AppCtx>({
  profile: null,
  refreshProfile: async () => {},
});

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<Profile>(null);

  const load = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      // If you don't have a 'profiles' table, this gracefully falls back
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      setProfile(data ?? { id: user.id, full_name: user.user_metadata?.full_name ?? null });
    } catch {
      setProfile({ id: user.id, full_name: user.user_metadata?.full_name ?? null });
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id]);

  return (
    <AppContext.Provider value={{ profile, refreshProfile: load }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * ✅ Compatibility shim for old code
 * Many components still import/use `useAppContext()` and expect:
 *   - user
 *   - loading
 *   - brandDNA (optional in some places)
 * We map these to the new providers so you don't have to rewrite 20+ files right now.
 */
export function useAppContext() {
  const { user, ready } = useAuth();
  const { profile } = useApp();
  return {
    user,                // same as before
    loading: !ready,     // old code used `loading`; we map it to !ready
    profile,
    brandDNA: null as any, // placeholder so imports don't break; wire real Brand DNA later
  };
}
