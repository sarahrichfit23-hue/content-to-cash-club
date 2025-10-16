// src/pages/MealPlans.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthProvider";

type PlanJSON = {
  days: number;
  client_name: string;
  diet_style: string;
  target_kcal: number;
  days_plan: {
    date: string;
    meals: {
      meal_type: "breakfast" | "lunch" | "dinner" | "snack";
      title: string;
      kcal: number;
    }[];
  }[];
  shopping_list?: { qty: string; unit: string; item: string }[];
  recipes?: any[];
};

export default function MealPlans() {
  const { user, ready } = useAuth(); // ← read auth state from provider
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [clientName, setClientName] = useState("Alex Client");
  const [dietStyle, setDietStyle] = useState("High-Protein");
  const [targetKcal, setTargetKcal] = useState(2000);
  const [days, setDays] = useState(7);
  const [notes, setNotes] = useState("No shellfish. 30 min max prep.");

  // Load coach + plans ONLY when auth is ready and user exists
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Wait for the initial auth check to finish
      if (!ready) return;

      // If there is no user, show the sign-in UI instead of hanging
      if (!user) {
        setLoading(false);
        setError("Not logged in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1) find (or create) the coach row for this user
        const { data: coach, error: cErr } = await supabase
          .from("coaches")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cErr && cErr.code !== "PGRST116") throw cErr;

        let coachRow = coach;
        if (!coachRow) {
          const { data: inserted, error: iErr } = await supabase
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
          if (iErr) throw iErr;
          coachRow = inserted;
        }

        if (!coachRow) throw new Error("Could not create or load coach row.");
        setCoachId(coachRow.id);

        // 2) load this coach's plans
        const { data: plansData, error: pErr } = await supabase
          .from("meal_plans")
          .select("id, created_at, plan")
          .eq("coach_id", coachRow.id)
          .order("created_at", { ascending: false });

        if (pErr) throw pErr;
        if (!cancelled) setPlans(plansData || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user?.id]);

  async function generateAndSavePlan() {
    try {
      setError(null);
      if (!user) throw new Error("Not logged in");
      if (!coachId) throw new Error("No coach id");

      // Call your serverless generator
      const resp = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          diet_style: dietStyle,
          target_kcal: targetKcal,
          days,
          notes,
        }),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || resp.statusText);
      }
      const plan: PlanJSON = await resp.json();

      // Make a minimal client row (or attach an existing one in your UI later)
      const { data: client, error: clErr } = await supabase
        .from("clients")
        .insert({ coach_id: coachId, name: clientName, diet_style: dietStyle })
        .select("id")
        .single();
      if (clErr) throw clErr;

      const { error: insErr } = await supabase.from("meal_plans").insert({
        coach_id: coachId,
        client_id: client.id,
        days: plan.days,
        target_kcal: plan.target_kcal,
        target_macros: null, // fill later when you add macro inputs
        constraints: { diet_style: plan.diet_style, notes },
        plan: plan as any,
      });
      if (insErr) throw insErr;

      // Refresh
      const { data: plansData, error: pErr } = await supabase
        .from("meal_plans")
        .select("id, created_at, plan")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;
      setPlans(plansData || []);
      alert("Plan created!");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function exportPdf(plan: PlanJSON) {
    const body = {
      brand_name: "My Coaching Brand",
      days: plan.days,
      client_name: plan.client_name,
      diet_style: plan.diet_style,
      target_kcal: plan.target_kcal,
      days_plan: plan.days_plan,
      shopping_list: plan.shopping_list,
      recipes: plan.recipes,
    };

   const resp = await fetch("http://localhost:3001/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      alert("PDF error: " + (e.error || resp.statusText));
      return;
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meal-plan.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ===== Render guards =====
  if (!ready) return <div className="p-6">Loading…</div>;

  if (!user || error === "Not logged in") {
    return (
      <div className="p-6">
        <p className="mb-3">Please sign in to create and view meal plans.</p>
        <Button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin },
            })
          }
        >
          Sign in with Google
        </Button>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  // ===== Main UI =====
  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Create Meal Plan</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Client name</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Diet style</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={dietStyle}
              onChange={(e) => setDietStyle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Target kcal/day</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={targetKcal}
              onChange={(e) => setTargetKcal(Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Days</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={days}
              onChange={(e) => setDays(Number(e.target.value || 0))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Notes / constraints</label>
            <textarea
              className="border rounded px-2 py-1 w-full"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={generateAndSavePlan} className="mt-3">
          Generate plan
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Saved Plans</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-neutral-600">No plans yet.</p>
        ) : (
          <ul className="space-y-3">
            {plans.map((p) => (
              <li key={p.id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Plan {p.id.slice(0, 8)}</div>
                  <div className="text-xs text-neutral-500">
                    {p.plan?.client_name || "Client"} • {p.plan?.diet_style || "n/a"} •{" "}
                    {p.plan?.days || 0} days
                  </div>
                </div>
                <Button onClick={() => exportPdf(p.plan)}>Export PDF</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
