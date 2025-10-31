import React, { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

// TODO: Replace with your real Stripe publishable key
const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXXXXXX");

export default function Checkout() {
  useEffect(() => {
    const createSessionAndRedirect = async () => {
      try {
        // Call your backend to create a Stripe Checkout Session
        // ⚠️ Use your live backend URL here!
        const response = await fetch(
          "https://content-to-cash-backend.onrender.com/api/create-checkout-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // if you use cookies/session
            body: JSON.stringify({ /* add user info here if needed */ }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to create Stripe session: ${response.statusText}`);
        }

        // Stripe's create-checkout-session endpoint should return { url } or { sessionId }
        const data = await response.json();

        // If your backend returns a URL (recommended by Stripe), redirect directly:
        if (data.url) {
          window.location.href = data.url;
          return;
        }

        // If your backend returns a sessionId (legacy approach), use Stripe.js to redirect:
        if (data.sessionId) {
          const stripe = await stripePromise;
          if (stripe) {
            const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
            if (error) {
              throw error;
            }
            return;
          }
        }

        throw new Error("Did not receive a valid Stripe Checkout URL or sessionId from backend.");
      } catch (err: any) {
        console.error("Checkout error:", err);
        alert(
          "There was a problem creating your checkout session. Please try again or contact support."
        );
      }
    };

    createSessionAndRedirect();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 border rounded-xl shadow-sm bg-card text-center space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p>
          You’ll be redirected to a secure Stripe page to enter your payment info and start your free trial.
        </p>
        <Button disabled>Redirecting…</Button>
      </div>
    </div>
  );
}