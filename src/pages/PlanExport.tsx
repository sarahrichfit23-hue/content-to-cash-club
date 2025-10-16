import { useState } from "react";

/**
 * Minimal brand + theme controls + a fake plan to prove the flow.
 * Clicking "Export PDF" POSTs to /api/render-pdf and downloads meal-plan.pdf
 */
type Theme = {
  colors: { primary: string; secondary: string; accent: string };
  fonts: { heading: string; body: string };
};
const defaultTheme: Theme = {
  colors: { primary: "#111827", secondary: "#6B7280", accent: "#2563EB" },
  fonts: { heading: "Inter", body: "Inter" },
};

export default function PlanExport() {
  const [brandName, setBrandName] = useState("NextLevel Health");
  const [logoUrl, setLogoUrl] = useState("");
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // ✅ demo plan payload — replace later with your AI output
  const [plan] = useState({
    days: 7,
    client_name: "Alex Client",
    diet_style: "High-Protein",
    target_kcal: 2000,
    days_plan: [
      {
        date: "Mon",
        meals: [
          { meal_type: "breakfast", title: "Greek Yogurt Bowl", kcal: 420 },
          { meal_type: "lunch", title: "Chicken Salad Wrap", kcal: 520 },
          { meal_type: "dinner", title: "Salmon + Rice", kcal: 680 },
          { meal_type: "snack", title: "Apple + PB", kcal: 180 },
        ],
      },
      {
        date: "Tue",
        meals: [
          { meal_type: "breakfast", title: "Oatmeal + Whey", kcal: 450 },
          { meal_type: "lunch", title: "Turkey Bowl", kcal: 560 },
          { meal_type: "dinner", title: "Stir-Fry Tofu", kcal: 620 },
          { meal_type: "snack", title: "Cottage Cheese", kcal: 200 },
        ],
      },
      // ...add Wed–Sun if you want; not required for test
    ],
  });

  async function exportPdf() {
    try {
      // This shape matches api/render-pdf.ts expectations from earlier
      const body = {
        brand_name: brandName,
        brand_logo_url: logoUrl, // not used by the minimal template, but fine to pass
        days: plan.days,
        client_name: plan.client_name,
        diet_style: plan.diet_style,
        target_kcal: plan.target_kcal,
        days_plan: plan.days_plan,
        theme, // ignored by the minimal template; useful when you upgrade templates
      };

      const resp = await fetch("/api/render-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || resp.statusText);
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
    } catch (e: any) {
      alert("PDF export failed: " + e.message);
      console.error(e);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Meal Plan → Branded PDF</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Brand</h2>
          <label className="block text-sm mb-1">Brand Name</label>
          <input
            className="border rounded px-2 py-1 w-full mb-3"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <label className="block text-sm mb-1">Logo URL (optional)</label>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="https://..."
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Theme (colors & fonts)</h2>
          <div className="grid grid-cols-3 gap-3">
            {(["primary", "secondary", "accent"] as const).map((k) => (
              <div key={k}>
                <label className="block text-sm mb-1">{k}</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={theme.colors[k]}
                  onChange={(e) =>
                    setTheme((t) => ({
                      ...t,
                      colors: { ...t.colors, [k]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm mb-1">Heading Font</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={theme.fonts.heading}
                onChange={(e) =>
                  setTheme((t) => ({ ...t, fonts: { ...t.fonts, heading: e.target.value } }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Body Font</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={theme.fonts.body}
                onChange={(e) =>
                  setTheme((t) => ({ ...t, fonts: { ...t.fonts, body: e.target.value } }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={exportPdf}
        className="inline-flex items-center px-4 py-2 rounded bg-black text-white"
      >
        Export PDF
      </button>

      <p className="text-xs text-neutral-500 mt-3">
        This uses a demo plan. Later, replace it with your AI output and your coach’s saved brand tokens.
      </p>
    </div>
  );
}
