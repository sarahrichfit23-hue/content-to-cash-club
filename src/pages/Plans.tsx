import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Plans from "./pages/Plans";
<Route path="/plans" element={<Plans />} />

type PlanRow = { id: string; plan: any };

export default function Plans() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("id, plan")
        .order("created_at", { ascending: false });
      if (error) setErr(error.message);
      else setPlans((data as any[]) || []);
    })();
  }, []);

  async function exportPdf(plan: any) {
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
    const resp = await fetch("/api/render-pdf", {
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
    a.href = url; a.download = "meal-plan.pdf";
    document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  }

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">My Meal Plans</h1>
      {plans.length === 0 ? (
        <p>No plans yet.</p>
      ) : (
        <ul className="space-y-3">
          {plans.map((p) => (
            <li key={p.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Plan {p.id.slice(0, 8)}</div>
                <div className="text-xs text-neutral-500">{p.plan?.client_name || "Client"}</div>
              </div>
              <button
                onClick={() => exportPdf(p.plan)}
                className="px-3 py-2 rounded bg-black text-white text-sm"
              >
                Export PDF
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
