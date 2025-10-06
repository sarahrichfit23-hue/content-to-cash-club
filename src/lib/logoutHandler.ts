import { supabase } from "@/lib/supabase";

const SIGNOFFS = [
  "Toodles! Don't stay gone too long—this money won't make itself 💸",
  "So long, King Kong! I'll be here when you're ready to get that bread 🥖",
  "Gotta go, Buffalo! Don't get too distracted—this money won't grow itself 🪴",
  "Bye-bye, money-maker. The algorithm already misses you ❤️",
  "Peace out, paycheck chaser. Let's not make this goodbye a habit 😉",
  "Catch you later, creator. Consistency looks good on you 🔥",
  "Logging off? Bold move. Hope your goals don't notice 😏",
  "Adios, ambitious one. May your Wi-Fi reconnect quickly!",
  "See ya soon, boss. I'll keep your hustle seat warm 🪑",
  "Don't be too long — your future self's already pacing the floor 💼"
];

export async function handleLogout(navigate: any) {
  try {
    // pick the next message in sequence
    const idx = Number(localStorage.getItem("logoutIndex")) || 0;
    const message = SIGNOFFS[idx % SIGNOFFS.length];
    localStorage.setItem("logoutIndex", String(idx + 1));

    // store for the interstitial page
    sessionStorage.setItem("signedOutMessage", message);

    // sign out via Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // navigate to signed-out screen
    navigate("/signed-out");
  } catch (e) {
    console.error("Logout error:", e);
    window.location.href = "/login";
  }
}
