import React, { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";

export default function UpgradeButton() {
  const user = useUser();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.id || !user?.email) {
      alert("You must be logged in to upgrade.");
      return;
    }

    setLoading(true);
    try {
     const apiUrl = import.meta.env.VITE_API_URL;
const res = await fetch(`${apiUrl}/api/create-checkout-session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: user.id,
    email: user.email,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redirects to Stripe
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition"
    >
      {loading ? "Redirecting..." : "Upgrade to Pro 💪"}
    </button>
  );
}
