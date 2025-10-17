import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

/* ---------------------------- Helpers ---------------------------- */

export async function getUserAccountability(userId: string) {
  const { data, error } = await supabase
    .from("user_accountability")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_accountability")
    .select("badges_earned")
    .eq("user_id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data.badges_earned || [];
}

export async function addBadge(userId: string, badge: string) {
  const existing = await fetchBadges(userId);
  if (!existing.includes(badge)) {
    const updated = [...existing, badge];
    const { error } = await supabase
      .from("user_accountability")
      .update({ badges_earned: updated })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    console.log(`🏅 Added badge: ${badge}`);
  }
}

/* ------------------------- Badge thresholds ------------------------- */

const BADGE_RULES = [
  { id: "first_step", requirement: (data: any) => data.total_checkins >= 1 },
  { id: "week_warrior", requirement: (data: any) => data.current_streak >= 7 },
  { id: "consistency_king", requirement: (data: any) => data.current_streak >= 30 },
  { id: "content_creator", requirement: (data: any) => data.total_checkins >= 50 },
  { id: "unstoppable", requirement: (data: any) => data.total_checkins >= 100 },
  { id: "legend", requirement: (data: any) => data.longest_streak >= 90 },
];

/* -------------------------- Update check-in -------------------------- */

export async function updateCheckin(userId: string) {
  const userData = await getUserAccountability(userId);
  const today = new Date().toISOString().slice(0, 10);
  const lastCheckin = userData.last_checkin_date;
  const currentStreak = userData.current_streak || 0;
  const longestStreak = userData.longest_streak || 0;
  const total = userData.total_checkins || 0;

  let newStreak = currentStreak;
  let newLongest = longestStreak;

  if (lastCheckin) {
    const diff =
      (new Date(today).getTime() - new Date(lastCheckin).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff === 1) newStreak += 1;
    else if (diff > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }

  if (newStreak > newLongest) newLongest = newStreak;

  const updatedData = {
    last_checkin_date: today,
    current_streak: newStreak,
    longest_streak: newLongest,
    total_checkins: total + 1,
  };

  const { error: updateError } = await supabase
    .from("user_accountability")
    .update(updatedData)
    .eq("user_id", userId);

  if (updateError) throw new Error(updateError.message);

  // 🏅 Award new badges
  const updated = { ...userData, ...updatedData };
  for (const badge of BADGE_RULES) {
    if (badge.requirement(updated)) await addBadge(userId, badge.id);
  }

  return { newStreak, newLongest };
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from("user_accountability")
    .select("user_id, display_name, avatar_url, current_streak, longest_streak")
    .eq("show_on_leaderboard", true)
    .order("current_streak", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export async function updateLeaderboardSettings(userId: string, updates: {
  display_name?: string;
  show_on_leaderboard?: boolean;
}) {
  const { error } = await supabase
    .from("user_accountability")
    .update(updates)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

