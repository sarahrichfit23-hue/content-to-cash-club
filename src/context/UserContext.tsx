import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient"; // ✅ correct import

interface UserContextType {
  user: any;
  role: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // ✅ Fetch the authenticated user and their role
  const refreshUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setRole(null);
        return;
      }

      setUser(user);

      // ✅ safer: won't throw 406 if 0 rows
      const { data, error } = await supabase
        .from("coaches")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.warn("⚠️ Unable to fetch user role:", error.message);
      }

      if (!data) {
        // no record yet → assume default
       console.log("ℹ️ No coach record yet for this user — defaulting to 'regular'");
setRole("regular");
        return;
      }

      setRole(data.role);
    } catch (err) {
      console.error("❌ Error refreshing user:", err);
    }
  };

  // ✅ Initial load and auth state listener
  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) refreshUser();
      else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, role, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
