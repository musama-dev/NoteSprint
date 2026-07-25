import Stripe from "stripe";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.model.js";

let stripe;
const getStripe = () => {
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
};

const PLANS = {
  starter: { amount: 99, credits: 60 },
  student: { amount: 199, credits: 150 },
  pro: { amount: 299, credits: 300 },
};

const MAX_CREDITS = 500;

const checkout = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS[planId];

  if (!plan) {
    throw new ApiError(400, "Invalid plan");
  }

  const user = await User.findById(req.userId);
  if (!user) {
    throw new ApiError(401, "Unauthorized: user not found");
  }
  if (user.credits + plan.credits >= MAX_CREDITS) {
    throw new ApiError(
      400,
      `Credit limit reached — you already have ${user.credits} credits and cannot hold more than ${MAX_CREDITS}. Use some credits before buying more.`,
    );
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/pricing?success=true`,
    cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan.credits} Credits`,
          },
          unit_amount: plan.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: req.userId,
      credits: plan.credits,
    },
  });

  return res.status(200).json(new ApiResponse(200, { url: session.url }));
});

const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    throw new ApiError(400, "Invalid webhook signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const creditsToAdd = Number(session.metadata.credits);

    if (userId && creditsToAdd) {
      await User.findByIdAndUpdate(userId, {
        $inc: { credits: creditsToAdd },
        $set: { isCreditAvailable: true },
      });
    }
  }

  return res.json({ received: true });
});

export { checkout, stripeWebhook };
