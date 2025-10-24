import React, { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXXXXXX"); // <-- Your publishable key

export default function Checkout() {
  useEffect(() => {
    const createSessionAndRedirect = async () => {
      // Call your backend to create a Stripe Checkout Session
      const response = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // if you use cookies/session
        body: JSON.stringify({ /* add user info here if needed */ })
      });
      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (stripe && sessionId) {
        stripe.redirectToCheckout({ sessionId });
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