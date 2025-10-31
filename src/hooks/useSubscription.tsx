import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // ✅ import your singleton instance

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  current_period_end?: string;
  grace_end_date?: string;
}

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // 🧭 Grace period check
  const isInGracePeriod = () => {
    if (!subscription?.grace_end_date) return false;
    const now = new Date();
    const graceEnd = new Date(subscription.grace_end_date);
    return now < graceEnd;
  };

  // 🔄 Fetch user subscription from Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.warn("⚠️ No subscription found:", error.message);
        }

        setSubscription(data || null);
      } catch (err) {
        console.error("❌ Failed to fetch subscription:", err);
        setSubscription(null);
      }
    };

    fetchSubscription();

    // 👂 Listen for subscription updates in real time
    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("⚡ Subscription changed:", payload.new);
          setSubscription(payload.new as Subscription);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { subscription, isInGracePeriod };
}