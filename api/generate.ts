// api/generate.ts — Vercel Edge Function compatible (no @vercel/node dependency)

export const config = {
  runtime: 'edge', // Run on Vercel Edge Network for speed and no Node deps
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = 'gpt-4o';

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { Allow: 'POST' },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
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
      return new Response(JSON.stringify({ error: 'OpenAI error', details: t }), { status: r.status });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? '[No content returned]';

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server error', details: e?.message || String(e) }), {
      status: 500,
    });
  }
}

