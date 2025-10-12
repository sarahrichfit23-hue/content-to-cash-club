import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { handleLogout } from '@/lib/logoutHandler';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  brand_name?: string;
  brand_dna?: any;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  tier: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  grace_period_end?: string;
}

interface AppContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  sidebarOpen: boolean;
  brandDNA: any;
  toggleSidebar: () => void;
  signOut: (navigate?: any) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // ✅ Fetch profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data || null);
    } catch (error) {
      console.error('⚠️ Error fetching profile:', error);
    }
  };

  // ✅ Fetch subscription
  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data || null);
    } catch (error) {
      console.error('⚠️ Error fetching subscription:', error);
    }
  };

const signOut = async (navigate?: any) => {
  try {
    console.log('🚪 Signing out...');

    toast({
      title: 'Signing out…',
      description: 'We’re safely logging you out.',
    });

    // ✅ Step 1: clear Supabase session
    const { error } = await supabase.auth.signOut();
    if (error) console.error('❌ Supabase signOut error:', error);

    // ✅ Step 2: clear local state
    setUser(null);
    setProfile(null);
    setSubscription(null);

    // ✅ Step 3: clear storage
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();

    // ✅ Step 4: redirect
    if (navigate) {
      console.log('➡️ Redirecting via handleLogout...');
      await handleLogout(navigate);
    } else {
      window.location.replace('/signed-out');
    }

    console.log('✅ Sign-out complete!');
  } catch (err) {
    console.error('⚠️ Sign-out error:', err);
    toast({
      title: 'Error signing out',
      description: 'Something went wrong. Please try again.',
      variant: 'destructive',
    });
  }
};



  // ✅ Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('⚠️ Error updating profile:', error);
    }
  };

  // ✅ Refresh subscription
  const refreshSubscription = async () => {
    if (!user) return;
    await fetchSubscription(user.id);
  };

  // ✅ Auth state listener (handles SIGNED_OUT immediately)
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
          await fetchSubscription(session.user.id);
        }
      } catch (error) {
        console.error('⚠️ Error initializing auth:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);

      // 🔴 Handle instant sign-out response
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchSubscription(session.user.id);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      authSub.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        sidebarOpen,
        brandDNA: profile?.brand_dna || null,
        toggleSidebar,
        signOut,
        updateProfile,
        refreshSubscription,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = useApp;

