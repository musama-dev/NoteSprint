import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./src/db/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import notesRoutes from "./src/routes/notes.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import { stripeWebhook } from "./src/controllers/payment.controller.js";
import { startEmailWorker } from "./src/queues/email.queue.js";
dotenv.config();

startEmailWorker();

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5000;
const app = express();

// Trust proxy for rate limiting on Vercel / Render / Cloudflare deployments
if (isProduction) {
  app.set("trust proxy", 1);
}

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// Global API Rate Limiter (15 minutes window, max 100 requests per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", globalLimiter);

// Stripe Webhook Endpoint (raw body required)
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running...", environment: process.env.NODE_ENV || "development" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/payment", paymentRoutes);

// Global Production Error Handling Middleware (Sanitizes stack traces & internal paths in production)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    isProduction && statusCode === 500
      ? "An unexpected server error occurred. Please try again later."
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { errors: err.errors || [], stack: err.stack }),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  connectDB().catch((err) => console.error("MongoDB Connection Failure:", err));
});
