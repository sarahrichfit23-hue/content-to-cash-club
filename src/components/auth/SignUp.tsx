import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function SignUp() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
 
  const [loading, setLoading] = useState(false);

  // Helper to get ?plan= from URL
  function getPlanFromQuery(): "starter" | "pro" | "elite" {
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    if (plan === "pro" || plan === "elite") return plan;
    return "starter";
  }

  // Stripe checkout links
  const stripeLinks: Record<"starter" | "pro" | "elite", string> = {
    starter: "https://buy.stripe.com/eVq8wR0uc7EOaze5MBbjW0J",
    pro: "https://buy.stripe.com/6oUbJ36SA7EO22I1wlbjW0K",
    elite: "https://buy.stripe.com/6oU5kF6SA3oygXC8YNbjW0L",
  };

  const handleSignUp = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);
    try {
      // 1) Send a magic link email so the user can log in after checkout
      const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
        options: {
       emailRedirectTo: "https://www.contenttocashclub.com"
        }
      });
     if (otpError) {
     toast({
   title: "Could not send login email",
   description: otpError.message,
      variant: "destructive",
});
return;
}

toast({
  title: "Check your email",
  description: "We sent you a secure login link. Complete checkout now, then use that email to log in.",
  });

  // 2) Redirect straight to Stripe Payment Link for the selected plan
  const plan = getPlanFromQuery();
  window.location.href = stripeLinks[plan];
  } catch (err: any) {
    toast({
      title: "Unexpected error",
      description: String(err?.message || err),
      variant: "destructive",
      });
      } finally {
        setLoading(false);
        }
        };

      // 1️⃣ Ensure a profile row is created for this new user before redirecting to Stripe
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name ?? null,
            has_paid: false,
            onboarding_completed: false,
            brand_dna: {},
          }, { upsert: true }); // upsert for safety in case user is re-signing up
      }

      // Redirect to the appropriate Stripe Checkout link
      const plan = getPlanFromQuery();
      window.location.href = stripeLinks[plan];
    } catch (err: any) {
      toast({ title: "Unexpected error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-xl shadow-sm bg-card">
        <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
        
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}