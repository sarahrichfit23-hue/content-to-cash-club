import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    res.json({
      summary: "Sample plan generated successfully!",
      days_plan: [],
      shopping_list: [],
      recipes: [],
    });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}