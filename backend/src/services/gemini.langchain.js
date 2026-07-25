import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import ApiError from "../utils/api-error.js";

let model;
const getModel = () => {
  if (!model) {
    model = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      json: true,
      maxOutputTokens: 16384,
      maxRetries: 2,
    });
  }
  return model;
};

export const generateGeminiResponse = async (prompt) => {
  try {
    const res = await getModel().invoke(prompt);
    return JSON.parse(res.content.replace(/```json|```/g, "").trim());
  } catch (error) {
    console.error("Gemini (langchain) error:", error.message);
    throw new ApiError(502, "Failed to generate notes, please try again");
  }
};
