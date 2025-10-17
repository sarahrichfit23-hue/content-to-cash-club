import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// 🔍 Search users by email or name
export async function searchUsers(query: string, excludeUserId: string) {
  const { data, error } = await supabase
    .from("profiles") // adjust if your profile table is named differently
    .select("id, full_name, email, avatar_url")
    .ilike("email", `%${query}%`)
    .neq("id", excludeUserId)
    .limit(10);

  if (error) throw error;
  return data;
}

// 🤝 Send a buddy request
export async function sendBuddyRequest(userId: string, buddyId: string) {
  const { error } = await supabase
    .from("accountability_buddies")
    .insert([{ user_id: userId, buddy_id: buddyId }]);
  if (error) throw error;
}

// 📥 Get requests (incoming + outgoing)
export async function getBuddyRequests(userId: string) {
  const { data, error } = await supabase
    .from("accountability_buddies")
    .select(`
      id,
      user_id,
      buddy_id,
      status,
      created_at,
      profiles!accountability_buddies_user_id_fkey(full_name, avatar_url),
      buddy:profiles!accountability_buddies_buddy_id_fkey(full_name, avatar_url)
    `)
    .or(`user_id.eq.${userId},buddy_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ Accept or reject
export async function updateBuddyStatus(id: string, status: "accepted" | "rejected") {
  const { error } = await supabase
    .from("accountability_buddies")
    .update({
      status,
      accepted_at: status === "accepted" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}
