import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // shared instance
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-hot-toast";
import { useUser } from "../context/UserContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useUser();

  // ✅ Detect session_id on redirect from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    if (sessionId) {
      const handleUpgradeSuccess = async () => {
        toast.loading("Finalizing your upgrade...");
        try {
          // Wait a moment for the webhook to update Supabase
          await new Promise((r) => setTimeout(r, 2000));

          const { data, error } = await supabase
            .from("coaches")
            .select("role")
            .eq("email", user?.email)
            .maybeSingle(); // ✅ safer than .single()

          if (error) {
            console.warn("⚠️ Supabase returned:", error.message);
          }

          if (data?.role === "pro") {
            toast.dismiss();
            toast.success("Upgrade successful! 🎉");
            await refreshUser();
            onClose();

            // Clean URL so session_id disappears
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, "", cleanUrl);
          } else {
            toast.dismiss();
            toast.error(
              "Upgrade not yet processed. Please wait a few seconds and refresh."
            );
          }
        } catch (err) {
          toast.dismiss();
          toast.error("Something went wrong confirming your upgrade.");
          console.error("❌ Upgrade confirmation error:", err);
        }
      };

      handleUpgradeSuccess();
    }
  }, [user, onClose, refreshUser]);

 
  const handleUpgrade = async () => {
  console.log("🟢 Upgrade button clicked"); // 👈 Add this line
  if (!user?.email) {
    console.log("🚫 No user email found:", user);
    toast.error("You must be logged in to upgrade.");
    return;
  }

  setLoading(true);

  console.log("🌐 Backend URL:", import.meta.env.VITE_API_URL);

  if (!user?.email) {
    toast.error("You must be logged in to upgrade.");
    return;
  }

  setLoading(true);

  // 👇 ADD THIS LINE RIGHT HERE
  console.log("🌐 Backend URL:", import.meta.env.VITE_API_URL);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      }
    );

    const data = await response.json();
    console.log("🔍 Checkout session response:", data);


      if (!data.url) {
        throw new Error("No checkout URL returned from backend");
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      window.location.href = data.url;
    } catch (error) {
      toast.dismiss();
      toast.error("Error creating checkout session.");
      console.error("❌ Stripe checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center">
        <h2 className="text-xl font-semibold mb-4">Upgrade to Pro</h2>
        <p className="text-gray-600 mb-6">
          Get full access to all premium features.
        </p>

        <button
          disabled={loading}
          onClick={handleUpgrade}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg w-full transition"
        >
          {loading ? "Loading..." : "Upgrade via Stripe"}
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
