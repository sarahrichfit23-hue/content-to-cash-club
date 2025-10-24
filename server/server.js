import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { OpenAI } from "openai";

// Import your Stripe router here:
import createStripeSession from "./create-stripe-session.js";

// Import your Calendar routes here:
import calendarRoutes from "./routes/calendarRoutes.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount your Stripe router here:
app.use("/", createStripeSession);

// Mount your Calendar routes here:
app.use("/api/calendar", calendarRoutes);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in .env file!");
  process.exit(1);
}
console.log("✅ Found OPENAI_API_KEY, starting server...");

// Create the OpenAI client instance
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ======= GOOGLE CALENDAR OAUTH START ROUTE =======
app.get('/api/calendar/start', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});
// ================================================

function buildPrompt({
  client_name,
  gender,
  age,
  height,
  weight,
  activity,
  goal,
  diet_style,
  restrictions,
  target_kcal,
  macros,
  notes,
  days,
}) {
  return `
TASK
You are a registered dietitian and advanced meal-plan generator. Produce a COMPLETE meal plan strictly as VALID JSON, with no markdown/code fences and no extra commentary.

CLIENT
Name: ${client_name || "N/A"}
Gender: ${gender}
Age: ${age}
Height: ${height} inches
Weight: ${weight} lbs
Activity Level: ${activity}
Goal: ${goal}
Diet Preference: ${diet_style}
Dietary Restrictions: ${restrictions && restrictions.length ? restrictions.join(", ") : "None"}
Target Calories: ${target_kcal} kcal/day
Macro Targets (% of daily kcal): Protein ${macros.protein}%, Carbs ${macros.carbs}%, Fat ${macros.fat}%
Notes: ${notes || "None"}
Number of Days to Generate: ${days}

GLOBAL RULES (FOLLOW ALL)
- Output JSON ONLY (no prose, no code fences).
- The plan must cover exactly ${days} day(s).
- No meal title or recipe may be repeated anywhere in the plan.
- Per-day calories within ±8% of ${target_kcal}; macros approximate Protein ${macros.protein}%, Carbs ${macros.carbs}%, Fat ${macros.fat}%.
- Respect all preferences/restrictions.
- Every meal in the plan MUST map to a recipe in "recipes" by exact title.
- Ingredient quantities must be realistic/measurable (e.g., "1 cup", "150 g", "2 large eggs").
- Instructions must be cookbook-style with at least 4 steps per recipe.
- Do not invent fields beyond the structures below.

STRUCTURES
If ${days} <= 7, return:
{
  "summary": "Short rationale incl. calorie target, macro split, timing, and how preferences/restrictions were handled.",
  "days_plan": [
    {
      "day": 1,
      "calories_target": ${target_kcal},
      "macros_target_pct": { "protein": ${macros.protein}, "carbs": ${macros.carbs}, "fat": ${macros.fat} },
      "meals": [
        {
          "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
          "title": "Exact recipe title (must exist in recipes)",
          "kcal": number,
          "protein_g": number,
          "carbs_g": number,
          "fat_g": number,
          "notes": "optional"
        }
      ]
    }
  ],
  "shopping_list": {
    "Pantry":   [ { "item": "name", "qty": "e.g., 1 can (15 oz)", "checked": false } ],
    "Produce":  [ { "item": "name", "qty": "e.g., 2 medium",      "checked": false } ],
    "Dairy & Eggs": [ { "item": "name", "qty": "e.g., 12 large",  "checked": false } ],
    "Protein":  [ { "item": "name", "qty": "e.g., 2 lb",          "checked": false } ]
  },
  "recipes": [
    {
      "title": "Exact recipe title (matches plan)",
      "ingredients": [ { "item": "name", "qty": "amount + unit" } ],
      "instructions": ["Step 1 ...","Step 2 ...","Step 3 ...","Step 4 ..."],
      "Used in": [ "Day X - breakfast", "Day Y - snack" ]
    }
  ]
}

If ${days} > 7, return:
{
  "summary": "...",
  "weeks": [
    {
      "week": 1,
      "days_plan": [ /* same shape as above */ ],
      "shopping_list": { /* same shape as above */ },
      "recipes": [ /* same shape as above */ ]
    }
  ]
}

VALIDATION (MUST PASS BEFORE YOU RETURN)
- Every meal in "days_plan[].meals[]" has a matching recipe title in "recipes".
- No duplicate recipe titles anywhere.
- All ingredients have quantities.
- "Used in" references are correct (existing day numbers and meal types).
- JSON parses without error.

RETURN
Return ONLY the JSON object described above. No surrounding text, no backticks, no explanations.
`;
}

async function callOpenAIWithContinuation(openai, messages, opts = {}) {
  const maxTurns = opts.maxTurns ?? 4;
  const model    = opts.model ?? "gpt-4";
  const params   = {
    model,
    messages,
    temperature: 0.3,
    max_tokens: 6000,
  };

  let fullText = "";
  for (let turn = 0; turn < maxTurns; turn++) {
    const resp = await openai.chat.completions.create(params);
    const choice = resp.choices?.[0];
    const chunk = choice?.message?.content || "";
    fullText += chunk;

    try {
      return { text: fullText, json: JSON.parse(fullText), finish_reason: choice?.finish_reason };
    } catch (_) {}

    const fr = choice?.finish_reason;
    if (fr && fr !== "length") {
      break;
    }

    messages = [
      ...messages,
      { role: "assistant", content: chunk },
      {
        role: "user",
        content:
          "Continue the SAME JSON from exactly where you stopped. Do not repeat earlier keys or wrap in code fences. Return ONLY the remaining JSON."
      }
    ];
  }

  return { text: fullText, json: JSON.parse(fullText), finish_reason: "completed-after-continues" };
}

app.post("/api/generate-plan", async (req, res) => {
  try {
    const {
      client_name,
      gender,
      age,
      height,
      weight,
      activity,
      goal,
      diet_style,
      restrictions,
      target_kcal,
      macros,
      notes,
      days,
    } = req.body;

    const prompt = buildPrompt({
      client_name,
      gender,
      age,
      height,
      weight,
      activity,
      goal,
      diet_style,
      restrictions,
      target_kcal,
      macros,
      notes,
      days,
    });

    const messages = [
      {
        role: "system",
        content:
          "You are a precise meal plan generator. Respond with VALID JSON only (no markdown, no code fences). Ensure uniqueness, calorie/macro compliance, and recipe mapping."
      },
      { role: "user", content: prompt }
    ];

    const { text, json, finish_reason } = await callOpenAIWithContinuation(openai, messages, {
      model: "gpt-4",
      maxTurns: 4
    });

    console.log("=== RAW AI RESPONSE START ===\n" + text + "\n=== RAW AI RESPONSE END ===");
    res.json(json);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI generation failed",
      details: error.message,
    });
  }
});

app.listen(3001, () => {
  console.log("Meal Plan AI backend running on port 3001");
});