const calendarRoutes = require('./routes/calendarRoutes');
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: Missing OpenAI API key! Add OPENAI_API_KEY to your .env file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
You are a nutrition expert and advanced meal planner.
Create a meal plan for a client with the following details, and strictly follow the output structure and ALL instructions below.

Client Details:
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
Macronutrient Breakdown: Protein ${macros.protein}%, Carbs ${macros.carbs}%, Fat ${macros.fat}%
Notes: ${notes || "None"}

#### STRICT OUTPUT STRUCTURE & RULES ####

1. Meals:
- Create a detailed meal plan for ${days} days${days > 7 ? " (grouped by week, e.g. Week 1: Days 1-7, etc.)" : ""}.
- Each meal and snack in the entire plan MUST be unique and NOT repeated on any other day.
- Absolutely do not repeat any meal title, recipe, or snack throughout the plan. If there are not enough unique ideas, invent new ones—do NOT reuse.
- Each meal in the plan must exactly match a recipe in the "Recipe Pack" section by title.

2. Shopping List:
- For each week, generate a categorized shopping list: "Pantry", "Produce", "Dairy & Eggs", "Protein" (meat, fish, or plant-based).
- List realistic, non-repetitive, specific ingredient quantities (e.g. "4 large eggs", "1 bunch kale", "2 lbs chicken breast", "1 can black beans").
- Present each category as a checklist array with checkboxes.

3. Recipe Pack:
- Provide a "Recipe Pack" for the entire plan (or for each week if multi-week).
- Each recipe must have:
  - Title (must match meal in plan)
  - List of ingredients (with realistic quantities)
  - Step-by-step cookbook-style instructions (minimum 4 steps, detailed)
  - "Used in": List all days/meals in the plan that use this recipe (e.g. "Day 1 - Breakfast, Day 3 - Snack")
- Recipes should be detailed, clear, and professional—like a real cookbook.

4. Output Format:
Return ONLY valid JSON.
If plan is longer than 7 days, structure JSON as:
{
  "summary": "...",
  "weeks": [
    {
      "week": 1,
      "days_plan": [{...}, ...],
      "shopping_list": {
        "Pantry": [ { "item": "oats", "qty": "1 lb", "checked": false }, ... ],
        "Produce": [ ... ],
        "Dairy & Eggs": [ ... ],
        "Protein": [ ... ]
      },
      "recipes": [ ... ]
    },
    ...
  ]
}
If 7 days or fewer, structure JSON as:
{
  "summary": "...",
  "days_plan": [ ... ],
  "shopping_list": {
    "Pantry": [ ... ],
    "Produce": [ ... ],
    "Dairy & Eggs": [ ... ],
    "Protein": [ ... ]
  },
  "recipes": [ ... ]
}

- DO NOT include markdown, explanations, or duplicate recipes.
- All recipes and ingredients must be referenced in the plan and shopping list.
- Recipes must be detailed and cookbook-style.
- Return ONLY valid JSON.

- The 'summary' should explain the rationale for the plan and the "magic numbers" (calories, macros, and meal timing).

- Do not invent any extra fields or sections.

#### OUTPUT BEGINS BELOW THIS LINE ####
`;
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

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    console.log("=== RAW AI RESPONSE START ===\n" + content + "\n=== RAW AI RESPONSE END ===");

    let json;
    try {
      json = JSON.parse(content);
    } catch {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match) {
        try {
          json = JSON.parse(match[1]);
        } catch (e) {
          throw new Error("Response looked like code block, but still couldn't parse as JSON.");
        }
      } else {
        throw new Error("Could not parse JSON from OpenAI response");
      }
    }
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
