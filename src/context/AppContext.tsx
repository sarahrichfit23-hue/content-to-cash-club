import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../supabase";

type AppContextType = {
  profile: any;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
    if (error) console.error("Error loading profile:", error);
    setProfile(data);
    setLoading(false);
  }

  useEffect(() => {
    refreshProfile();
  }, []);

  const value: AppContextType = {
    profile,
    loading,
    refreshProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}

