import { supabase } from "./supabaseClient";

export async function getOrCreateCoachRow() {
  // Try to get the coach row for the logged-in user
  const { data: coach, error } = await supabase.from("coaches").select("*").single();

  if (coach) return coach;

  // If no row yet, create a default one for this user
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not logged in");

  const { data: inserted, error: insErr } = await supabase
    .from("coaches")
    .insert({
      user_id: user.id,
      brand_name: "My Coaching Brand",
      brand_primary: "#111827",
      brand_secondary: "#6B7280",
      brand_font_heading: "Inter",
      brand_font_body: "Inter",
    })
    .select("*")
    .single();

  if (insErr) throw insErr;
  return inserted;
}
