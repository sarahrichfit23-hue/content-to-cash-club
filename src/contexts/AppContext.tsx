import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  full_name?: string | null;
  has_paid?: boolean;
  onboarding_completed?: boolean;
  brand_dna?: any;
  [key: string]: any;
} | null;

type AppCtx = {
  profile: Profile;
  refreshProfile: () => Promise<void>;
  updateProfile: (fields: Record<string, any>) => Promise<void>;
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

  // Load user profile from Supabase, auto-create if missing
  const load = async () => {
    setLoading(true);
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // If no profile row, create it!
      if (!data) {
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name ?? null,
            has_paid: false,
            onboarding_completed: false,
            brand_dna: {},
          })
          .select()
          .maybeSingle();
        if (insertError) throw insertError;
        data = inserted;
      }

      setProfile(data ?? { id: user.id, full_name: user.user_metadata?.full_name ?? null });
    } catch (e) {
      setProfile({ id: user.id, full_name: user.user_metadata?.full_name ?? null });
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

  const value: AppCtx = {
    profile,
    refreshProfile: load,
    updateProfile,
    user,
    loading: !ready || loading,
    brandDNA: profile?.brand_dna ?? null,
    hasPaid: !!(profile && (profile.has_paid ?? false)),
    ready,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

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