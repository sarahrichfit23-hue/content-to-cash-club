import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Stripe from "stripe";
import { OpenAI } from "openai";

import createStripeSession from "./create-stripe-session.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

const app = express();

// --- CORS CONFIG ---
// Only allow your live frontend (no www) and localhost for development
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://contenttocashclub.com",
        "http://localhost:5173"
      ];
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// --- STRIPE WEBHOOK ENDPOINT (must come BEFORE JSON parser) ---
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️ Webhook verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Stripe checkout.session.completed:", session.id);
      // Optionally update Supabase or notify user here
    }

    res.status(200).json({ received: true });
  }
);

// --- Enable JSON parsing for all other routes ---
app.use(bodyParser.json());

// --- STRIPE VERIFY ENDPOINT (used by StripeSuccess.tsx) ---
app.get("/api/stripe/verify", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.payment_status === "paid") {
      console.log("✅ Payment verified for session:", sessionId);
      return res.json({ success: true });
    } else {
      console.warn("⚠️ Payment not verified:", sessionId);
      return res.json({ success: false });
    }
  } catch (error) {
    console.error("❌ Stripe verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Mount other routers ---
app.use("/", createStripeSession);
app.use("/api/calendar", calendarRoutes);

// --- OPENAI (Meal Plan Generator) CONFIG ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: Missing OpenAI API key! Add OPENAI_API_KEY to your .env file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- (keep your buildPrompt + callOpenAIWithContinuation functions here) ---
// (Omitted for brevity — no changes required from your version)

// --- Meal Plan Endpoint ---
app.post("/api/generate-plan", async (req, res) => {
  try {
    // (same as your existing version)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI generation failed",
      details: error.message,
    });
  }
});

// --- PORT CONFIG ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});