// src/pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";

// ⬇️ Make sure you add your OpenAI key in Vercel later under "Environment Variables"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = "gpt-4o-mini"; // You can change to "gpt-4o" if your key supports it

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const {
      template = "Social post",
      tone = "Friendly",
      style = "Professional",
      length = "Medium",
      brandDNA = "",
      instructions = "",
    } = req.body || {};

    const systemPrompt = `You are an expert content generator for online coaches. Return concise, high-converting copy only.`;

    const userPrompt = `
Create a ${template} for an online coach.
Tone: ${tone}. Style: ${style}. Length: ${length}.
Brand DNA/context: ${brandDNA || "N/A"}.
Extra instructions: ${instructions || "N/A"}.

Output:
- Hook (1–2 lines)
- Body (3–6 lines)
- CTA (1 line)
- 5 hashtags (if social post)
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "OpenAI error", details: errorText });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? "[No content returned]";

    return res.status(200).json({ content });
  } catch (error: any) {
    return res.status(500).json({ error: "Server error", details: error?.message || error });
  }
}
