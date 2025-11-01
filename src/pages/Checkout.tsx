import React, { useEffect } from "react";

export default function Checkout() {
useEffect(() => {
  // Redirect directly to your Stripe Payment Link (Starter by default)
window.location.href = "https://buy.stripe.com/eVq8wR0uc7EOaze5MBbjW0J";
}, []);
return (
<div className="flex items-center justify-center min-h-screen bg-background">
  <div className="w-full max-w-md p-8 border rounded-xl shadow-sm bg-card text-center space-y-6">
    <h1 className="text-2xl font-semibold">Redirecting to Checkout…</h1>
    <p>You’ll be redirected to a secure Stripe page to start your free trial.</p>
  </div>
</div>
);
}