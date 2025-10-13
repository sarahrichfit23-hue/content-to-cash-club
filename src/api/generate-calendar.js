// src/api/generate-calendar.js
export async function generateCalendar() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Check your .env.local file.");
  }

  const prompt = `
  Create a detailed 30-day social media content calendar for a business coach helping female entrepreneurs.
  Include content ideas, themes, and post types for each day.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a marketing strategist and content planner." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error("No content returned from OpenAI.");
  }

  // Return just the AI’s generated plan
  return data.choices[0].message.content;
}
