import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Crown } from "lucide-react";

interface LeaderboardUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Load initial leaderboard and subscribe to updates
  useEffect(() => {
    loadLeaderboard();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_accountability",
        },
        () => loadLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("user_accountability")
      .select("user_id, display_name, avatar_url, current_streak, longest_streak")
      .eq("show_on_leaderboard", true)
      .order("current_streak", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Error loading leaderboard:", error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading leaderboard...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-xl bg-white/60">
        No users on the leaderboard yet.
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-xl bg-white/60 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-lg">🏆 Accountability Leaderboard</h3>
      </div>

      <ul className="space-y-3">
        {users.map((u, i) => (
          <li
            key={u.user_id}
            className={`flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm transition-all ${
              i === 0
                ? "border-yellow-400 shadow-md"
                : i === 1
                ? "border-gray-300"
                : i === 2
                ? "border-amber-200"
                : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              {u.avatar_url ? (
                <img
                  src={u.avatar_url}
                  alt={u.display_name ?? "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                  {u.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
              )}

              <span className="font-medium text-gray-700">
                {i + 1}. {u.display_name || "Anonymous"}
              </span>
            </div>

            <div className="flex flex-col text-right text-sm font-semibold text-amber-600">
              <span>🔥 {u.current_streak} days</span>
              <span className="text-gray-500 text-xs">
                Max: {u.longest_streak}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
