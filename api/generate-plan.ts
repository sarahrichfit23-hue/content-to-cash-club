// api/generate-plan.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { z } from 'zod';

const bodySchema = z.object({
  client_name: z.string().min(1),
  diet_style: z.string().min(1),
  target_kcal: z.number().int().positive(),
  days: z.number().int().min(1).max(14),
  notes: z.string().optional(),
});

const PlanSchema = z.object({
  days: z.number().int(),
  client_name: z.string(),
  diet_style: z.string(),
  target_kcal: z.number().int(),
  days_plan: z.array(z.object({
    date: z.string(),
    meals: z.array(z.object({
      meal_type: z.enum(['breakfast','lunch','dinner','snack']),
      title: z.string(),
      kcal: z.number().int().nonnegative()
    })).min(2)
  })),
  shopping_list: z.array(z.object({
    qty: z.string(),
    unit: z.string(),
    item: z.string()
  })).optional(),
  recipes: z.array(z.any()).optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsed.error.format() });
    }

    const { client_name, diet_style, target_kcal, days, notes } = parsed.data;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!openai.apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY missing on server' });
    }

    // Prompt for a compact, well-structured JSON plan
    const system = `
You are a registered dietitian AI. Always return STRICT JSON only, no prose.
The JSON must match the schema below.

Schema:
{
  "days": number,
  "client_name": string,
  "diet_style": string,
  "target_kcal": number,
  "days_plan": [
    {
      "date": "YYYY-MM-DD",
      "meals": [
        {"meal_type":"breakfast"|"lunch"|"dinner"|"snack","title":string,"kcal":number}
      ]
    }
  ],
  "shopping_list": [{"qty":string,"unit":string,"item":string}],
  "recipes": []
}

Rules:
- Distribute kcal across the day (e.g., B 25%, L 30%, D 35%, snacks 10%) unless diet_style implies otherwise.
- Respect diet_style and notes/constraints.
- Keep meal titles short and appetizing. Kcal are integers.
- Dates should start from today and go sequentially for "days" length.
- Provide a concise shopping_list covering all meals (merge duplicates).
`.trim();

    const user = `
Client: ${client_name}
Diet style: ${diet_style}
Target kcal/day: ${target_kcal}
Days: ${days}
Notes/constraints: ${notes ?? 'None'}
`.trim();

    // Prefer JSON responses. If your model supports response_format, use it; otherwise parse.
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or another JSON-capable model available to you
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' as const }
    });

    const raw = completion.choices?.[0]?.message?.content ?? '{}';
    let planJson: unknown;
    try {
      planJson = JSON.parse(raw);
    } catch {
      // Fallback: try to strip fence if model added ```json ... ```
      const clean = raw.replace(/```json|```/g, '');
      planJson = JSON.parse(clean);
    }

    const valid = PlanSchema.safeParse(planJson);
    if (!valid.success) {
      return res.status(502).json({
        error: 'AI returned invalid plan format',
        details: valid.error.format(),
        raw
      });
    }

    return res.status(200).json(valid.data);
  } catch (err: any) {
    console.error('[generate-plan] error', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}