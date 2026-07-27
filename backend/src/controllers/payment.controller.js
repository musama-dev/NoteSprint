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
  if (user.credits + plan.credits > MAX_CREDITS) {
    throw new ApiError(
      400,
      `Credit limit reached — you already have ${user.credits} credits and cannot hold more than ${MAX_CREDITS}. Use some credits before buying more.`,
    );
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json(new ApiResponse(200, { url: `${clientUrl}/checkout?plan=${planId}` }));
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      success_url: `${clientUrl}/pricing?success=true`,
      cancel_url: `${clientUrl}/pricing?canceled=true`,
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
  } catch (error) {
    console.log("Stripe checkout session error, falling back to mock sandbox:", error.message);
    return res.status(200).json(new ApiResponse(200, { url: `${clientUrl}/checkout?plan=${planId}` }));
  }
});

const processMockPayment = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS[planId];

  if (!plan) {
    throw new ApiError(400, "Invalid plan");
  }

  const user = await User.findById(req.userId);
  if (!user) {
    throw new ApiError(401, "Unauthorized: user not found");
  }

  // Restrict mock credit purchase strictly to musama0065@gmail.com
  if (user.email?.toLowerCase().trim() !== "musama0065@gmail.com") {
    throw new ApiError(
      403,
      "Credit purchase is currently reserved for demo account."
    );
  }

  if (user.credits + plan.credits > MAX_CREDITS) {
    throw new ApiError(
      400,
      `Credit limit reached — you already have ${user.credits} credits and cannot hold more than ${MAX_CREDITS}. Use some credits before buying more.`,
    );
  }

  user.credits += plan.credits;
  user.isCreditAvailable = true;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      user,
      message: `Successfully added ${plan.credits} credits!`,
    })
  );
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

export { checkout, processMockPayment, stripeWebhook };
