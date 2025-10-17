console.log("Card:", Card, "CardHeader:", CardHeader, "CardContent:", CardContent);
console.log("Tabs:", Tabs, "TabsList:", TabsList, "TabsTrigger:", TabsTrigger, "TabsContent:", TabsContent);
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2 } from "lucide-react";
import ReactToPrint from "react-to-print";

const AI_PLAN_ENDPOINT = "/api/generate-plan";

type MealPlanResponse = {
  summary: string;
  days_plan: any[];
  shopping_list: { qty: string; unit: string; item: string }[];
  recipes: { title: string; ingredients: string[]; instructions: string }[];
};

const activityMultiplier: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const goalAdjustments: Record<string, number> = {
  fat_loss: 0.85,
  maintenance: 1,
  muscle_gain: 1.15,
};

const macroPresets = {
  fat_loss: { protein: 40, carbs: 30, fat: 30, desc: "Lean & efficient — high protein to preserve muscle." },
  maintenance: { protein: 35, carbs: 40, fat: 25, desc: "Balanced macros for steady energy and consistency." },
  muscle_gain: { protein: 30, carbs: 45, fat: 25, desc: "Fuel growth — more carbs for recovery and training." },
};

const funMessages = [
  "🍳 Cooking up your personalized plan...",
  "🥦 Balancing your macros and goals...",
  "🔥 Grilling those calories to perfection...",
  "🧂 Sprinkling motivation on your meals...",
  "🥕 Chopping data and veggies alike...",
];

const StepClient = React.memo(function StepClient({ client, setClient, setStep, setNutrition }) {
  const handleClientChange = useCallback(
    (field, value) => setClient((prev) => ({ ...prev, [field]: value })),
    [setClient]
  );

  return (
    <Card className="p-6 shadow-sm bg-white rounded-xl">
      <CardHeader>
        <h2 className="text-xl font-semibold">Client Info</h2>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <Label>Client Name (optional)</Label>
          <Input
            value={client.name}
            onChange={(e) => handleClientChange("name", e.target.value)}
            placeholder="Leave blank for general plan"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Gender</Label>
            <Select
              value={client.gender}
              onValueChange={(v) => handleClientChange("gender", v)}
            >
              <SelectTrigger className="bg-gray-50 text-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Age</Label>
            <Input
              type="number"
              value={client.age}
              onChange={(e) =>
                handleClientChange("age", Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Height (inches)</Label>
            <Input
              type="number"
              value={client.height}
              onChange={(e) =>
                handleClientChange("height", Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Weight (lbs)</Label>
            <Input
              type="number"
              value={client.weight}
              onChange={(e) =>
                handleClientChange("weight", Number(e.target.value))
              }
            />
          </div>
        </div>

        <div>
          <Label>Activity Level</Label>
          <Select
            value={client.activity}
            onValueChange={(v) => handleClientChange("activity", v)}
          >
            <SelectTrigger className="bg-gray-50 text-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="light">Light (1–2x/week)</SelectItem>
              <SelectItem value="moderate">Moderate (3–4x/week)</SelectItem>
              <SelectItem value="active">Active (5–6x/week)</SelectItem>
              <SelectItem value="very_active">Very Active (daily)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Goal</Label>
          <Select
            value={client.goal}
            onValueChange={(v) => {
              handleClientChange("goal", v);
              setNutrition((n) => ({ ...n, ...macroPresets[v], mode: "auto" }));
            }}
          >
            <SelectTrigger className="bg-gray-50 text-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fat_loss">Fat Loss</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between mt-4">
          <span />
          <Button
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const StepNutrition = React.memo(function StepNutrition({ nutrition, setNutrition, setStep }) {
  const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;

  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">Nutrition Overview</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="mb-2 text-gray-700">
          Estimated Calories:{" "}
          <strong className="text-yellow-700">{nutrition.kcal} kcal/day</strong>
        </p>

        <div className="flex justify-between items-center mb-2">
          <Label>Macro Mode</Label>
          <Button
            variant="outline"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            onClick={() =>
              setNutrition((n) => ({
                ...n,
                mode: n.mode === "auto" ? "manual" : "auto",
              }))
            }
          >
            {nutrition.mode === "auto" ? "Switch to Manual" : "Use Auto Presets"}
          </Button>
        </div>

        {nutrition.mode === "manual" ? (
          <>
            <div>
              <Label>Protein: {nutrition.protein}%</Label>
              <Slider
                min={10}
                max={70}
                step={1}
                value={[nutrition.protein]}
                onValueChange={([v]) => setNutrition((n) => ({ ...n, protein: v }))}
              />
            </div>
            <div>
              <Label>Carbs: {nutrition.carbs}%</Label>
              <Slider
                min={10}
                max={70}
                step={1}
                value={[nutrition.carbs]}
                onValueChange={([v]) => setNutrition((n) => ({ ...n, carbs: v }))}
              />
            </div>
            <div>
              <Label>Fats: {nutrition.fat}%</Label>
              <Slider
                min={10}
                max={70}
                step={1}
                value={[nutrition.fat]}
                onValueChange={([v]) => setNutrition((n) => ({ ...n, fat: v }))}
              />
            </div>
            <p className="text-xs text-gray-500 italic">
              Ensure total ≈ 100% (currently {totalMacros}%)
            </p>
          </>
        ) : (
          <p className="text-sm italic text-gray-600">{nutrition.desc}</p>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={() => setStep(3)}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
});

const AiLoadingModal = React.memo(function AiLoadingModal({ aiMessage }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <Loader2 className="w-10 h-10 text-yellow-600 animate-spin mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-2">Generating your meal plan...</h2>
        <p className="text-sm text-gray-600 italic mb-4">{aiMessage}</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 animate-progress" />
        </div>
      </div>
    </div>
  );
});

const StepResults = React.memo(function StepResults({ plan, setStep }) {
  const resultsRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">Your AI Meal Plan</h2>
      </CardHeader>
      <CardContent>
        <div ref={resultsRef}>
          {!plan ? (
            <p className="text-gray-500">No plan generated yet.</p>
          ) : (
            <>
              <Tabs defaultValue="plan">
                <TabsList className="mb-4">
                  <TabsTrigger value="plan">🗓 Plan</TabsTrigger>
                  <TabsTrigger value="shopping">🛒 Shopping</TabsTrigger>
                  <TabsTrigger value="recipes">📖 Recipes</TabsTrigger>
                  <TabsTrigger value="summary">💬 Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="plan">
                  {plan.days_plan.map((day, i) => (
                    <div key={i} className="mb-4 border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold mb-2">{day.date || `Day ${i + 1}`}</h3>
                      <ul className="space-y-1 text-sm">
                        {day.meals?.map((m: any, j: number) => (
                          <li key={j}>
                            <strong>{m.meal_type}:</strong> {m.title} ({m.kcal} kcal)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="shopping">
                  <ul className="space-y-1 text-sm">
                    {plan.shopping_list?.map((item, i) => (
                      <li key={i}>{item.qty} {item.unit} {item.item}</li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="recipes">
                  {plan.recipes?.map((r, i) => (
                    <div key={i} className="mb-4 border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold mb-2">{r.title}</h3>
                      <p className="text-sm font-medium">Ingredients:</p>
                      <ul className="text-sm list-disc ml-5 mb-2">
                        {r.ingredients.map((ing, j) => (
                          <li key={j}>{ing}</li>
                        ))}
                      </ul>
                      <p className="text-sm font-medium">Instructions:</p>
                      <p className="text-sm">{r.instructions}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="summary">
                  <p className="text-sm leading-relaxed">{plan.summary}</p>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
        <div className="flex gap-4 mt-6">
          <ReactToPrint
            trigger={() => (
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                📄 Download / Print PDF
              </Button>
            )}
            content={() => resultsRef.current}
            documentTitle="Meal Plan"
          />
          <Button variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(1)}>
            🔁 Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default function MealPlanAssistant() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState(funMessages[0]);
  const [plan, setPlan] = useState<MealPlanResponse | null>(null);

  const [client, setClient] = useState({
    name: "",
    age: 30,
    gender: "female",
    height: 65,
    weight: 150,
    activity: "moderate",
    goal: "fat_loss",
  });

  const [preferences, setPreferences] = useState({
    dietStyle: "Balanced",
    restrictions: [] as string[],
    notes: "",
    days: 7,
  });

  const [nutrition, setNutrition] = useState({
    kcal: 0,
    protein: 40,
    carbs: 30,
    fat: 30,
    desc: macroPresets["fat_loss"].desc,
    mode: "auto",
  });

  // calculateBMR and calculateTargets are stable
  const calculateBMR = useCallback((gender: string, weight: number, height: number, age: number) => {
    const w = weight * 0.453592;
    const h = height * 2.54;
    if (gender === "female") return 10 * w + 6.25 * h - 5 * age - 161;
    return 10 * w + 6.25 * h - 5 * age + 5;
  }, []);

  const calculateTargets = useCallback(() => {
    const bmr = calculateBMR(
      client.gender,
      client.weight,
      client.height,
      client.age
    );
    const tdee = bmr * activityMultiplier[client.activity];
    const adjusted = tdee * goalAdjustments[client.goal];
    setNutrition((n) => ({ ...n, kcal: Math.round(adjusted) }));
  }, [client, calculateBMR]);

  // Only recalculate when client changes and on entry to nutrition step
  useEffect(() => {
    if (step === 2) {
      calculateTargets();
    }
  }, [step, calculateTargets]);

  useEffect(() => {
    if (loading) {
      let i = 0;
      const interval = setInterval(() => {
        setAiMessage(funMessages[i % funMessages.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch(AI_PLAN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: client.name || "Client",
          diet_style: preferences.dietStyle,
          target_kcal: nutrition.kcal,
          macros: {
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
          },
          days: preferences.days,
          notes: preferences.notes,
        }),
      });

      if (!res.ok) throw new Error("Backend unavailable");
      const data = (await res.json()) as MealPlanResponse;
      setPlan(data);
      setStep(5);
    } catch {
      // Fallback demo plan (no backend)
      setPlan({
        summary: "Demo plan loaded successfully! (backend offline)",
        days_plan: [
          {
            date: "Day 1",
            meals: [
              { meal_type: "Breakfast", title: "Oatmeal with Berries", kcal: 350 },
              { meal_type: "Lunch", title: "Grilled Chicken Salad", kcal: 500 },
              { meal_type: "Dinner", title: "Salmon with Quinoa", kcal: 600 },
            ],
          },
        ],
        shopping_list: [
          { qty: "1 lb", unit: "chicken breast", item: "" },
          { qty: "1 cup", unit: "quinoa", item: "" },
          { qty: "2", unit: "lemons", item: "" },
        ],
        recipes: [
          {
            title: "Grilled Chicken Salad",
            ingredients: ["chicken breast", "mixed greens", "olive oil", "lemon juice"],
            instructions: "Grill chicken and serve on greens with olive oil and lemon.",
          },
        ],
      });
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const stepContent = useMemo(() => {
    if (step === 1)
      return (
        <StepClient
          client={client}
          setClient={setClient}
          setStep={setStep}
          setNutrition={setNutrition}
        />
      );
    if (step === 2)
      return (
        <StepNutrition
          nutrition={nutrition}
          setNutrition={setNutrition}
          setStep={setStep}
        />
      );
    if (step === 3)
      return (
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold">Meal Preferences</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Diet Style</Label>
              <Select
                value={preferences.dietStyle}
                onValueChange={(v) => setPreferences({ ...preferences, dietStyle: v })}
              >
                <SelectTrigger className="bg-gray-50 text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                  <SelectItem value="High Protein">High Protein</SelectItem>
                  <SelectItem value="Low Carb">Low Carb</SelectItem>
                  <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="Plant-Based">Plant-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dietary Restrictions</Label>
              <Select
                onValueChange={(v) =>
                  setPreferences((p) => ({
                    ...p,
                    restrictions: p.restrictions.includes(v)
                      ? p.restrictions
                      : [...p.restrictions, v],
                  }))
                }
              >
                <SelectTrigger className="bg-gray-50 text-gray-800">
                  <SelectValue placeholder="Select restriction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gluten-Free">Gluten-Free</SelectItem>
                  <SelectItem value="Dairy-Free">Dairy-Free</SelectItem>
                  <SelectItem value="Nut-Free">Nut-Free</SelectItem>
                  <SelectItem value="Soy-Free">Soy-Free</SelectItem>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm mt-2 text-gray-600">
                {preferences.restrictions.join(", ") || "None selected"}
              </p>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={3}
                value={preferences.notes}
                onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
              />
            </div>

            <div>
              <Label>Plan Duration</Label>
              <Select
                value={String(preferences.days)}
                onValueChange={(v) => setPreferences({ ...preferences, days: Number(v) })}
              >
                <SelectTrigger className="bg-gray-50 text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="21">21 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white"
                onClick={handleGeneratePlan}
              >
                Generate Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    if (step === 5)
      return <StepResults plan={plan} setStep={setStep} />;
    return null;
  }, [step, client, nutrition, preferences, plan, setNutrition, setStep]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">🧠 Meal Plan Generator</h1>
      <p className="text-gray-600 mb-6">
        Create customized, macro-balanced meal plans for your clients.
      </p>
      {stepContent}
      {loading && <AiLoadingModal aiMessage={aiMessage} />}
    </div>
  );
}