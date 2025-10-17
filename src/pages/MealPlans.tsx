import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthProvider";
import { useApp } from "@/contexts/AppContext";
import { Loader2, Brain, Search, FileDown } from "lucide-react";

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

export default function MealPlanAssistant() {
  const { user, ready } = useAuth();
  const { subscription } = useApp();
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanJSON | null>(null);

  // form state
  const [clientName, setClientName] = useState("");
  const [dietStyle, setDietStyle] = useState("");
  const [targetKcal, setTargetKcal] = useState(2000);
  const [days, setDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  // filtering & pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // 🧠 Restrict to upgraded tiers only
  const userTier = subscription?.tier ?? "starter";
  const isUpgraded = ["pro", "elite", "admin"].includes(userTier.toLowerCase());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!ready) return;
      if (!user) {
        setLoading(false);
        setError("Not logged in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

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
            })
            .select("*")
            .single();
          if (iErr) throw iErr;
          coachRow = inserted;
        }

        setCoachId(coachRow.id);

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
      setGenerating(true);
      if (!user) throw new Error("Not logged in");
      if (!coachId) throw new Error("No coach ID");

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
        constraints: { diet_style: plan.diet_style, notes },
        plan: plan as any,
      });
      if (insErr) throw insErr;

      const { data: plansData, error: pErr } = await supabase
        .from("meal_plans")
        .select("id, created_at, plan")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });
      if (pErr) throw pErr;

      setPlans(plansData || []);
      alert("✅ Meal plan generated successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
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

    const resp = await fetch("/api/generate-plan", {
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

  // ===== Access control =====
  if (!ready) return <div className="p-6">Loading…</div>;
  if (!isUpgraded)
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-semibold mb-3">
          🚫 Meal Plan Generator Assistant is for upgraded members only
        </h2>
        <p className="text-muted-foreground mb-6">
          Upgrade to <strong>Pro</strong> or <strong>Elite</strong> to unlock this feature.
        </p>
        <Button
          onClick={() => (window.location.href = "/upgrade")}
          className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg"
        >
          Upgrade Now
        </Button>
      </div>
    );

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  // ===== Filters + Pagination =====
  const filtered = plans.filter((p) =>
    p.plan?.client_name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // ===== Main UI =====
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 py-8">
      {/* Left Panel */}
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">🍽️ Meal Plan Generator Assistant</h1>
          <p className="text-muted-foreground mb-4">
            Generate and manage meal plans for your clients.
          </p>

          <div className="grid gap-3">
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Diet style"
              value={dietStyle}
              onChange={(e) => setDietStyle(e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              placeholder="Target kcal/day"
              value={targetKcal}
              onChange={(e) => setTargetKcal(Number(e.target.value || 0))}
            />
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(Number(e.target.value || 0))}
            />
            <textarea
              className="border rounded px-2 py-1 w-full"
              placeholder="Notes / Constraints"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            onClick={generateAndSavePlan}
            className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-white flex items-center gap-2"
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" /> Generate Plan
              </>
            )}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Saved Plans</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-600">No saved plans.</p>
          ) : (
            <ul className="space-y-3">
              {current.map((p) => (
                <li
                  key={p.id}
                  onClick={() => setSelectedPlan(p.plan)}
                  className={`border rounded p-3 cursor-pointer hover:bg-yellow-50 ${
                    selectedPlan?.client_name === p.plan?.client_name
                      ? "bg-yellow-100"
                      : ""
                  }`}
                >
                  <div className="font-medium">{p.plan?.client_name}</div>
                  <div className="text-xs text-neutral-500">
                    {p.plan?.diet_style || "n/a"} • {p.plan?.days || 0} days
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Right Panel - Preview */}
      <div className="space-y-4">
        {selectedPlan ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">
                {selectedPlan.client_name}’s Plan
              </h2>
              <Button
                onClick={() => exportPdf(selectedPlan)}
                variant="outline"
                className="flex items-center gap-2 text-yellow-700 border-yellow-400 hover:bg-yellow-50"
              >
                <FileDown className="w-4 h-4" /> Export PDF
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {selectedPlan.diet_style} • {selectedPlan.days} days •{" "}
              {selectedPlan.target_kcal} kcal/day
            </p>

            <div className="space-y-4">
              {selectedPlan.days_plan?.map((day, i) => (
                <div key={i}>
                  <h3 className="font-medium mb-1">{day.date}</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {day.meals.map((m, j) => (
                      <li key={j}>
                        <strong>{m.meal_type}</strong>: {m.title} ({m.kcal} kcal)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            Select a plan from the left to preview.
          </Card>
        )}
      </div>
    </div>
  );
}
