// api/generate.ts  (Vercel Serverless Function for Vite projects)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = 'gpt-4o';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      template = 'Social post',
      tone = 'Friendly',
      style = 'Professional',
      length = 'Medium',
      brandDNA = '',
      instructions = '',
    } = body;

    const system = `You are an expert content generator for online coaches. Return concise, high-converting copy only.`;

    const user = `
Create a ${template} for an online coach.
Tone: ${tone}. Style: ${style}. Length: ${length}.
Brand DNA/context: ${brandDNA || 'N/A'}.
Extra instructions: ${instructions || 'N/A'}.

Output:
- Hook (1–2 lines)
- Body (3–6 lines)
- CTA (1 line)
- 5 hashtags (if social post)
`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: 'OpenAI error', details: t });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? '[No content returned]';
    return res.status(200).json({ content });
  } catch (e: any) {
    return res.status(500).json({ error: 'Server error', details: e?.message || String(e) });
  }
}
