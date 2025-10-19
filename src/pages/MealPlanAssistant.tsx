import jsPDF from "jspdf";
import React, { useState, useEffect } from "react";
import { generatePlan } from "../api/apiClient"; // Adjust the path as needed

// ====== CONSTANTS ======
const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little or no exercise)", factor: 1.2 },
  { value: "lightly active", label: "Lightly active (light exercise 1-3 days/week)", factor: 1.375 },
  { value: "moderately active", label: "Moderately active (moderate exercise 3-5 days/week)", factor: 1.55 },
  { value: "very active", label: "Very active (hard exercise 6-7 days/week)", factor: 1.725 },
  { value: "extra active", label: "Extra active (very hard exercise & physical job)", factor: 1.9 }
];
const GOALS = [
  { value: "lose fat", label: "Lose Fat", adjust: -500 },
  { value: "gain muscle", label: "Gain Muscle", adjust: 250 },
  { value: "maintain weight", label: "Maintain Weight", adjust: 0 },
  { value: "lose fat, gain muscle", label: "Lose Fat & Gain Muscle", adjust: -250 }
];
const DIET_STYLES = [
  "balanced",
  "low carb",
  "high protein",
  "vegetarian",
  "vegan",
  "paleo",
  "keto",
  "mediterranean"
];
const MACRO_SUGGESTIONS = {
  "lose fat":       { protein: 40, carbs: 30, fat: 30 },
  "gain muscle":    { protein: 30, carbs: 50, fat: 20 },
  "maintain weight":{ protein: 30, carbs: 40, fat: 30 },
  "lose fat, gain muscle": { protein: 35, carbs: 35, fat: 30 }
};
const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };
const SHOPPING_CATS = ["Pantry", "Produce", "Dairy & Eggs", "Protein"];

// ====== HELPERS ======
function calculateCalories({ gender, age, height, weight, activity, goal }) {
  if (!gender || !age || !height || !weight || !activity || !goal) return "";
  const weightKg = Number(weight) * 0.453592;
  const heightCm = Number(height) * 2.54;
  let bmr;
  if (gender === "Female") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else if (gender === "Male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  }
  const activityObj = ACTIVITY_LEVELS.find(a => a.value === activity);
  const activityFactor = activityObj ? activityObj.factor : 1.2;
  let goalAdjust = 0;
  if (goal === "lose fat") goalAdjust = -500;
  else if (goal === "gain muscle") goalAdjust = 250;
  else if (goal === "lose fat, gain muscle") goalAdjust = -250;
  let tdee = bmr * activityFactor + goalAdjust;
  if (gender === "Female" && tdee < 1200) tdee = 1200;
  if (gender === "Male" && tdee < 1500) tdee = 1500;
  return Math.round(tdee);
}

function calculateMacrosGramsAndCals(totalCals, macros) {
  let proteinGrams = ((macros.protein / 100) * totalCals) / CALORIES_PER_GRAM.protein;
  let carbsGrams = ((macros.carbs / 100) * totalCals) / CALORIES_PER_GRAM.carbs;
  let fatGrams = ((macros.fat / 100) * totalCals) / CALORIES_PER_GRAM.fat;
  return {
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbsGrams),
    fat: Math.round(fatGrams),
    proteinCals: macros.protein / 100 * totalCals,
    carbsCals: macros.carbs / 100 * totalCals,
    fatCals: macros.fat / 100 * totalCals
  };
}

// ====== COMPONENTS ======
function ShoppingList({ shopping, checklist, setChecklist }) {
  if (!shopping) return null;
  return (
    <div>
      {SHOPPING_CATS.map(cat =>
        Array.isArray(shopping[cat]) && shopping[cat].length > 0 ? (
          <div key={cat} className="mb-5">
            <h4 className="text-gold-700 font-semibold">{cat}</h4>
            <ul className="list-none pl-0">
              {shopping[cat].map((item, idx) => (
                <li key={cat + idx} className="mb-1">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checklist[cat]?.[idx]}
                      onChange={() => {
                        setChecklist(prev => ({
                          ...prev,
                          [cat]: {
                            ...(prev[cat] || {}),
                            [idx]: !prev[cat]?.[idx]
                          }
                        }));
                      }}
                      className="mr-2"
                    />
                    {item.qty ? `${item.qty} ` : ""}
                    {item.unit && !item.qty?.includes(item.unit) ? `${item.unit} ` : ""}
                    {item.item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      )}
    </div>
  );
}

function RecipePack({ recipes }) {
  if (!Array.isArray(recipes) || recipes.length === 0) return <div>No recipes found.</div>;
  return (
    <div>
      {recipes.map((rec, idx) => (
        <div key={idx} className="mb-8">
          <h4 className="mb-1 text-lg font-bold text-gray-900">{rec.title}</h4>
          {rec["Used in"] && (
            <div className="text-sm text-gold-700 mb-1">
              <b>Appears in:</b> {rec["Used in"]}
            </div>
          )}
          <b>Ingredients:</b>
          <ul className="mb-2">
            {Array.isArray(rec.ingredients) && rec.ingredients.length > 0
              ? rec.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
              : <li>No ingredients provided.</li>
            }
          </ul>
          <b>Instructions/Prep:</b>
          <ol className="ml-5 list-decimal">
            {Array.isArray(rec.instructions) && rec.instructions.length > 0
              ? rec.instructions.map((step, sidx) => (
                  <li key={sidx}>{step.trim()}</li>
                ))
              : rec.prep
                ? <li>{rec.prep}</li>
                : <li>No instructions provided.</li>
            }
          </ol>
        </div>
      ))}
    </div>
  );
}

function DaysMealPlan({ days_plan }) {
  if (!Array.isArray(days_plan) || days_plan.length === 0) {
    return <div className="text-gray-400">No meal plan days found yet.</div>;
  }
  return (
    <div>
      {days_plan.map((day, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            {day?.date || `Day ${day.day || idx + 1}`}
          </h3>
          <table className="w-full border-collapse mb-2 text-sm">
            <thead>
              <tr className="bg-yellow-100">
                <th className="py-2 px-3 border-b border-gold-200">Meal</th>
                <th className="py-2 px-3 border-b border-gold-200">Dish</th>
                <th className="py-2 px-3 border-b border-gold-200">Calories</th>
              </tr>
            </thead>
            <tbody>
              {/* Support both v1 (meals array) and v2 (breakfast/lunch/dinner/snack keys) */}
              {Array.isArray(day.meals) && day.meals.length > 0
                ? day.meals.map((meal, mi) => (
                    <tr key={mi}>
                      <td className="py-2 px-3 border-b border-gray-100">{meal.meal_type}</td>
                      <td className="py-2 px-3 border-b border-gray-100">{meal.title}</td>
                      <td className="py-2 px-3 border-b border-gray-100">{meal.kcal || ""}</td>
                    </tr>
                  ))
                : ["breakfast", "lunch", "dinner", "snack"].map(mealType =>
                    day[mealType] ? (
                      <tr key={mealType}>
                        <td className="py-2 px-3 border-b border-gray-100">
                          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </td>
                        <td className="py-2 px-3 border-b border-gray-100">{day[mealType]}</td>
                        <td className="py-2 px-3 border-b border-gray-100"></td>
                      </tr>
                    ) : null
                  )
              }
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function WeeksPlan({ weeks }) {
  const [openWeek, setOpenWeek] = useState(0);
  const [allChecklist, setAllChecklist] = useState({});
  if (!Array.isArray(weeks) || weeks.length === 0) return null;
  return (
    <div>
      <div className="flex gap-3 mb-5">
        {weeks.map((week, idx) => (
          <button
            key={idx}
            onClick={e => {e.preventDefault(); setOpenWeek(idx);}}
            className={`px-4 py-2 rounded-lg font-semibold border ${
              openWeek === idx ? "bg-yellow-400 border-yellow-400" : "bg-yellow-100 border-yellow-400"
            }`}
          >
            Week {week.week}
          </button>
        ))}
      </div>
      <section className="mb-10">
        <h2 className="text-gold-700 text-xl font-bold mb-2">Meal Plan - Week {weeks[openWeek]?.week}</h2>
        <DaysMealPlan days_plan={weeks[openWeek]?.days_plan} />
      </section>
      <section className="bg-yellow-50 p-6 rounded-xl mb-8 border border-yellow-200">
        <h2 className="text-gold-700 text-xl font-bold mb-2">Shopping List - Week {weeks[openWeek]?.week}</h2>
        <ShoppingList
          shopping={weeks[openWeek]?.shopping_list}
          checklist={allChecklist[openWeek] || {}}
          setChecklist={c => setAllChecklist(prev => ({...prev, [openWeek]: c}))}
        />
      </section>
      <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
        <h2 className="text-gold-700 text-xl font-bold mb-2">Recipe Pack - Week {weeks[openWeek]?.week}</h2>
        <RecipePack recipes={weeks[openWeek]?.recipes} />
      </section>
    </div>
  );
}

function SingleWeekPlan({ plan }) {
  const [checklist, setChecklist] = useState({});
  return (
    <div>
      <section className="mb-10">
        <h2 className="text-gold-700 text-xl font-bold mb-2">Meal Plan</h2>
        <DaysMealPlan days_plan={plan?.days_plan} />
      </section>
      <section className="bg-yellow-50 p-6 rounded-xl mb-8 border border-yellow-200">
        <h2 className="text-gold-700 text-xl font-bold mb-2">Shopping List</h2>
        <ShoppingList
          shopping={plan?.shopping_list}
          checklist={checklist}
          setChecklist={setChecklist}
        />
      </section>
      <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
        <h2 className="text-gold-700 text-xl font-bold mb-2">Recipe Pack</h2>
        <RecipePack recipes={plan?.recipes} />
      </section>
    </div>
  );
}

// ====== MAIN PAGE: MealPlanAssistant ======
export default function MealPlanAssistant() {
  const [form, setForm] = useState({
    client_name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    activity: "",
    goal: "",
    diet_style: "",
    restrictions: "",
    target_kcal: "",
    macros: { protein: "", carbs: "", fat: "" },
    notes: "",
    days: 4, // changed default to 4
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [macrosEdited, setMacrosEdited] = useState(false);
  const [manualCals, setManualCals] = useState(false);

  useEffect(() => {
    if (!manualCals) {
      const autoCals = calculateCalories(form);
      setForm(prev => ({
        ...prev,
        target_kcal: autoCals
      }));
    }
    // eslint-disable-next-line
  }, [form.gender, form.age, form.height, form.weight, form.activity, form.goal]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "goal") {
      const macros = MACRO_SUGGESTIONS[value] || { protein: "", carbs: "", fat: "" };
      setForm(prev => ({
        ...prev,
        goal: value,
        macros: { ...macros }
      }));
      setMacrosEdited(false);
      setManualCals(false);
      return;
    }
    if (["protein", "carbs", "fat"].includes(name)) {
      setForm(prev => ({
        ...prev,
        macros: { ...prev.macros, [name]: value }
      }));
      setMacrosEdited(true);
    } else if (name === "target_kcal") {
      setManualCals(true);
      setForm(prev => ({
        ...prev,
        target_kcal: value
      }));
    } else if (name === "days") {
      setForm(prev => ({
        ...prev,
        days: Math.min(Number(value), 4) // limit to 4
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
      if (["gender","age","height","weight","activity","goal"].includes(name)) {
        setManualCals(false);
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const payload = {
        ...form,
        days: Math.min(Number(form.days), 4), // enforce max 4
        restrictions: form.restrictions.split(",").map(s => s.trim()).filter(Boolean),
        macros: {
          protein: form.macros.protein,
          carbs: form.macros.carbs,
          fat: form.macros.fat,
        },
      };

     // CHANGE THIS URL TO YOUR DEPLOYED BACKEND ON RENDER, ETC!
// For local dev: "http://localhost:3001/api/generate-plan"
// For deployed: "https://content-to-cash-club.onrender.com"

export async function generatePlan(payload: any) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Unknown error");
  }

  return data;
}
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const macros = {
    protein: Number(form.macros.protein) || 0,
    carbs: Number(form.macros.carbs) || 0,
    fat: Number(form.macros.fat) || 0,
  };
  const totalCals = Number(form.target_kcal) || 0;
  const macrosInfo = calculateMacrosGramsAndCals(totalCals, macros);

  const macroSuggestionText = form.goal && MACRO_SUGGESTIONS[form.goal]
    ? `Suggested macros for '${form.goal}': Protein ${MACRO_SUGGESTIONS[form.goal].protein}%, Carbs ${MACRO_SUGGESTIONS[form.goal].carbs}%, Fat ${MACRO_SUGGESTIONS[form.goal].fat}%`
    : "";

  function downloadPlanAsPDF() {
    if (!plan) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text("Meal Plan Summary", 10, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(plan.summary || "No summary", 10, y);
    y += 12;

    (plan.days_plan || []).forEach((day, idx) => {
      doc.setFontSize(14);
      doc.text(day.date || `Day ${day.day || idx + 1}`, 10, y);
      y += 8;
      doc.setFontSize(12);
      ["breakfast", "lunch", "dinner", "snack"].forEach(mealType => {
        if (day[mealType]) {
          doc.text(
            `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${day[mealType]}`,
            12,
            y
          );
          y += 7;
        }
      });
      y += 4;
      if (y > 270) { doc.addPage(); y = 10; }
    });

    doc.save("meal-plan.pdf");
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        <span role="img" aria-label="brain">🧠</span> Meal Plan Generator
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Create customized, macro-balanced meal plans for your clients.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 mb-12 border border-yellow-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Client Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-6">
          {/* All client info fields, as before */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Client Name (optional)
              <input
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                placeholder="Leave blank for general plan"
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50 focus:outline-gold-600"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Gender
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
              >
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Age
              <input
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
                placeholder="e.g. 30"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Height (inches)
              <input
                name="height"
                type="number"
                value={form.height}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
                placeholder="e.g. 65"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Weight (lbs)
              <input
                name="weight"
                type="number"
                value={form.weight}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
                placeholder="e.g. 140"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Activity Level
              <select
                name="activity"
                value={form.activity}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
              >
                <option value="">Select</option>
                {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Goal
              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
              >
                <option value="">Select</option>
                {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <div className="text-gold-700 text-xs mt-1">
              {macroSuggestionText}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Target Calories per day
              <input
                name="target_kcal"
                type="number"
                value={form.target_kcal}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50 font-semibold text-gold-700"
              />
              <span className="block text-xs text-gray-500">Auto-calculated from your info & goal, but editable</span>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Macros (%)
              <div className="flex gap-2 items-center mt-1">
                Protein <input className="w-14 rounded-md border border-yellow-200 px-2 py-1 bg-yellow-50" name="protein" value={form.macros.protein} onChange={handleChange} placeholder="30" />%
                Carbs <input className="w-14 rounded-md border border-yellow-200 px-2 py-1 bg-yellow-50" name="carbs" value={form.macros.carbs} onChange={handleChange} placeholder="40" />%
                Fat <input className="w-14 rounded-md border border-yellow-200 px-2 py-1 bg-yellow-50" name="fat" value={form.macros.fat} onChange={handleChange} placeholder="30" />%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                (Protein and carbs have 4 calories/gram, fat has 9 calories/gram.)
                <div className="text-red-500">
                  {macros.protein + macros.carbs + macros.fat !== 100 && "Warning: Macros must add up to 100!"}
                </div>
              </div>
            </label>
            {macros.protein + macros.carbs + macros.fat === 100 && totalCals > 0 && (
              <div className="text-xs text-gold-700 bg-yellow-50 p-2 rounded mt-2 border border-yellow-200">
                <b>Your daily macro breakdown:</b><br/>
                Protein: {macrosInfo.protein}g ({Math.round(macrosInfo.proteinCals)} kcal),&nbsp;
                Carbs: {macrosInfo.carbs}g ({Math.round(macrosInfo.carbsCals)} kcal),&nbsp;
                Fat: {macrosInfo.fat}g ({Math.round(macrosInfo.fatCals)} kcal)
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Number of Days (up to 4 at a time)
              <input
                name="days"
                type="number"
                min={1}
                max={4}
                value={form.days}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
              />
              <span className="block text-xs text-gray-500">
                Enter a number between 1 and 4. For longer plans, please generate in batches.
              </span>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Diet Preference
              <select
                name="diet_style"
                value={form.diet_style}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
              >
                <option value="">Select</option>
                {DIET_STYLES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Restrictions
              <input
                name="restrictions"
                value={form.restrictions}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
                placeholder="e.g. gluten, nuts"
              />
              <span className="block text-xs text-gray-500">Comma separated (e.g. dairy, gluten, nuts)</span>
            </label>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Notes
              <input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-yellow-200 px-3 py-2 bg-yellow-50"
                placeholder="e.g. likes spicy, hates broccoli"
              />
            </label>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-7 rounded-xl shadow transition-all disabled:bg-yellow-200"
          >
            {loading ? "Generating..." : "Generate Meal Plan"}
          </button>
          {error && <div className="text-red-600 mt-3 font-semibold">{error}</div>}
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-400"></div>
          <div className="text-gold-700 text-lg font-semibold">Creating your custom meal plan...</div>
        </div>
      )}

      {plan && (
        <div>
          <section className="bg-yellow-50 p-6 rounded-xl mb-8 border border-yellow-200">
            <h2 className="text-gold-700 text-xl font-bold mb-2">The Reason Behind Your Magic Numbers</h2>
            <p>{plan.summary}</p>
          </section>
          {Array.isArray(plan.weeks) && plan.weeks.length > 0 ? (
            <WeeksPlan weeks={plan.weeks} />
          ) : (
            <SingleWeekPlan plan={plan} />
          )}
        </div>
      )}
      {plan && (
        <button
          onClick={downloadPlanAsPDF}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      )}
    </div>
  );
}
