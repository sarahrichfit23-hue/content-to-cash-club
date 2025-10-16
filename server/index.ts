import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express, { Request, Response } from "express";
import cors from "cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import { z } from "zod";

// ---------- 🧪 Verify environment variables ----------
console.log("🔑 STRIPE key starts with:", process.env.STRIPE_SECRET_KEY?.slice(0, 10));
console.log("📦 Loading env from:", process.cwd());

// ---------- EXPRESS ----------
const app = express();

// ✅ CORS fix
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Confirm Stripe key exists before starting
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env file");
  process.exit(1);
}

// ✅ Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/* ---------- ⚡ STRIPE WEBHOOK (MUST BE FIRST BEFORE express.json) ---------- */
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error("❌ Missing STRIPE_WEBHOOK_SECRET");
      return res.status(500).send("Server misconfiguration");
    }

    try {
      // ✅ Verify event with raw body
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        endpointSecret
      );

      // ✅ Handle checkout completion
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const email = session.customer_email;
        const tier = session.metadata?.tier || "pro";

        console.log("💥 Webhook received:", event.type);
        console.log(`➡️ Upgrading user with email ${email} to ${tier}`);

        // ✅ Create Supabase admin client using service role key
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ✅ Upsert (insert if missing, update if exists)
        const { error } = await supabase
          .from("coaches")
          .upsert({ email, role: tier }, { onConflict: "email" });

        if (error) {
          console.error("❌ Failed to update Supabase role:", error.message);
        } else {
          console.log(`✅ Successfully upgraded ${email} to ${tier}`);
        }
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error("❌ Webhook verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

/* ---------- ENABLE JSON AFTER WEBHOOK ---------- */
app.use(express.json({ limit: "2mb" }));

/* ---------- STRIPE CHECKOUT ---------- */
app.post("/api/create-checkout-session", async (req: Request, res: Response) => {
  console.log("💰 Received checkout request:", req.body);

  try {
    const { user_id, email, tier } = req.body;

    if (!user_id || !email)
      return res.status(400).json({ error: "Missing user_id or email" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Meal Plan ${tier?.toUpperCase()} Access` },
            unit_amount: tier === "elite" ? 29900 : tier === "pro" ? 12900 : 4900,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/upgrade-cancelled",
      metadata: { tier, email },
    });

    console.log(`✅ Created Stripe session for ${email} (${tier})`);
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Error creating Stripe session:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/* ---------- AI & PDF ROUTES ---------- */
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
  days_plan: z.array(
    z.object({
      date: z.string(),
      meals: z.array(
        z.object({
          meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
          title: z.string(),
          kcal: z.number().int().nonnegative(),
        })
      ),
    })
  ),
  shopping_list: z
    .array(
      z.object({
        qty: z.string(),
        unit: z.string(),
        item: z.string(),
      })
    )
    .optional(),
});

app.post("/api/generate-plan", async (req: Request, res: Response) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.format(),
      });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { client_name, diet_style, target_kcal, days, notes } = parsed.data;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Generate a structured meal plan JSON only." },
        {
          role: "user",
          content: `Client: ${client_name}, Diet: ${diet_style}, ${target_kcal} kcal/day, ${days} days, Notes: ${notes}`,
        },
      ],
      response_format: { type: "json_object" as const },
    });

    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    const planJson = JSON.parse(raw);
    const valid = PlanSchema.safeParse(planJson);
    if (!valid.success)
      return res.status(502).json({ error: "AI returned invalid format" });

    res.status(200).json(valid.data);
  } catch (err: any) {
    console.error("❌ /api/generate-plan error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

app.post("/api/render-pdf", (req: Request, res: Response) => {
  const plan = req.body as any;
  if (!plan?.days_plan)
    return res.status(400).json({ error: "Invalid plan payload" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="meal-plan.pdf"');

  const doc = new PDFDocument({ size: "LETTER", margin: 50 });
  doc.pipe(res);
  doc.fontSize(26).text(`${plan.client_name} — ${plan.diet_style} Plan`);
  doc.end();
});

/* ---------- HELLO TEST ---------- */
app.get("/api/hello", (_, res) =>
  res.json({ ok: true, msg: "hello from API" })
);

/* ---------- START SERVER ---------- */
// ✅ Export the Express app for Vercel serverless runtime
export default app;
