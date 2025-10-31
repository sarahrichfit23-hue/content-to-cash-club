import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabaseClient';

/**
 * Legacy/compatibility note:
 * This context exposes all old and new context fields that legacy code, new code,
 * or any component might expect. This means:
 * - `profile`: user profile object from Supabase
 * - `refreshProfile`: refreshes the profile
 * - `updateProfile`: updates the profile (for onboarding, BrandDNA, etc)
 * - `user`, `loading`, `brandDNA`, `hasPaid`, etc: legacy fields
 * - All functions are always defined (no-ops if not used)
 */

type Profile = {
  id: string;
  full_name?: string | null;
  has_paid?: boolean;
  onboarding_completed?: boolean;
  brand_dna?: any;
  [key: string]: any;
} | null;

type AppCtx = {
  // Core
  profile: Profile;
  refreshProfile: () => Promise<void>;
  updateProfile: (fields: Record<string, any>) => Promise<void>;
  // Legacy/compat fields
  user: any;
  loading: boolean;
  brandDNA: any;
  hasPaid: boolean;
  ready: boolean;
};

const AppContext = createContext<AppCtx>({
  profile: null,
  refreshProfile: async () => {},
  updateProfile: async () => {},
  user: null,
  loading: false,
  brandDNA: null,
  hasPaid: false,
  ready: false,
});

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Supabase
  const load = async () => {
    setLoading(true);
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      setProfile(
        data ??
          {
            id: user.id,
            full_name: user.user_metadata?.full_name ?? null,
            // fill other legacy fields if needed
          }
      );
    } catch {
      setProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? null,
      });
    }
    setLoading(false);
  };

  // Update user profile in Supabase
  const updateProfile = async (fields: Record<string, any>) => {
    if (!user) throw new Error("No user logged in");
    const { error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', user.id);
    if (error) throw error;
    await load();
  };

  useEffect(() => {
    if (!ready) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id]);

  // Expose ALL legacy and new fields
  const value: AppCtx = {
    profile,
    refreshProfile: load,
    updateProfile,
    user, // legacy: direct from useAuth
    loading: !ready || loading, // legacy: "loading" is true if not ready or profile loading
    brandDNA: profile?.brand_dna ?? null, // legacy: allow direct access to brandDNA
    hasPaid: !!(profile && (profile.has_paid ?? false)), // legacy: allow direct access
    ready,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Compatibility shim for old code (legacy hook)
 * Exposes all legacy fields and functions, always defined.
 */
export function useAppContext() {
  const ctx = useApp();
  return {
    user: ctx.user,
    loading: ctx.loading,
    profile: ctx.profile,
    brandDNA: ctx.brandDNA,
    hasPaid: ctx.hasPaid,
    refreshProfile: ctx.refreshProfile,
    updateProfile: ctx.updateProfile,
    ready: ctx.ready,
  };
}