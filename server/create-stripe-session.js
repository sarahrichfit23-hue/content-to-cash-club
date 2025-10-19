const express = require("express");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/create-stripe-session", async (req, res) => {
  const { email, userId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: "price_XXXXXXXXXXXX", // Your Stripe price ID
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: userId },
      },
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;