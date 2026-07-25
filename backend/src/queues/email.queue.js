import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { sendEmail } from "../libs/mail.js";

const redisUrl = () => process.env.REDIS_URL || "redis://localhost:6379";

const welcomeContent = (name) => ({
  body: {
    name,
    intro:
      "Welcome to NoteSprint AI! Your account is ready and 50 free credits are already in your wallet.",
    action: {
      instructions:
        "Type any topic and get exam-ready notes, diagrams, charts and PDFs in seconds:",
      button: {
        color: "#7c3aed",
        text: "Generate your first notes",
        link: `${process.env.FRONTEND_URL}/notes`,
      },
    },
    outro: "Happy studying! — The NoteSprint AI team",
  },
});

const sendWelcome = (name, email) =>
  sendEmail({
    email,
    subject: "Welcome to NoteSprint AI 🎉 50 free credits inside",
    mailgenContent: welcomeContent(name),
  });

let emailQueue;
const getQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue("email", {
      // fail fast when redis is down so signup never hangs — we fall back to a direct send
      connection: new IORedis(redisUrl(), {
        maxRetriesPerRequest: null,
        connectTimeout: 3000,
        enableOfflineQueue: false,
      }),
    });
    emailQueue.on("error", () => {});
  }
  return emailQueue;
};

export const queueWelcomeEmail = async (user) => {
  try {
    await getQueue().add(
      "welcome",
      { name: user.name, email: user.email },
      {
        jobId: `welcome-${user._id}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
  } catch (error) {
    console.error("Could not queue welcome email, sending directly:", error.message);
    sendWelcome(user.name, user.email);
  }
};

export const startEmailWorker = () => {
  const worker = new Worker(
    "email",
    async (job) => {
      await sendWelcome(job.data.name, job.data.email);
    },
    { connection: new IORedis(redisUrl(), { maxRetriesPerRequest: null, retryStrategy: () => null }) },
  );
  worker.on("completed", (job) => console.log(`Welcome email sent to ${job.data.email}`));
  worker.on("failed", (job, err) =>
    console.error(`Email job failed for ${job?.data?.email}:`, err.message),
  );
  worker.on("error", () => {});
};
