"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // read ?redirect=/meal-plans (defaults to "/")
  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("redirect") || "/";
  }, [location.search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // If we arrive here already signed in (e.g., returned from Google),
  // immediately bounce to the redirect target.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate(redirectPath, { replace: true });
      }
    })();
  }, [navigate, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Welcome back!", description: "You’ve logged in successfully." });
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      toast({ title: "Unexpected error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      // Important: send users back to /login with the same redirect param
      // so after OAuth returns and session is present, the effect above will
      // auto-navigate them to redirectPath.
      const returnTo = `${window.location.origin}/login?redirect=${encodeURIComponent(redirectPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: returnTo },
      });
      if (error) {
        toast({ title: "Google login failed", description: error.message, variant: "destructive" });
      }
      // Browser will redirect, so no further code here.
    } catch (err: any) {
      toast({ title: "Unexpected error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-xl shadow-sm bg-card">
        <h1 className="text-2xl font-semibold text-center">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>

        <Button type="submit" className="w-full" disabled={loadingEmail}>
            {loadingEmail ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          {loadingGoogle ? "Redirecting…" : "Sign in with Google"}
        </Button>
      
      <p className="text-center mt-6 text-sm text-muted-foreground">
  Don’t have an account?{" "}
  <a href="/signup" className="text-blue-600 underline font-semibold">
    Sign up
  </a>
</p>
      </div>
    </div>
  );
}
