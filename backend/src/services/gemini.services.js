import ApiError from "../utils/api-error.js";

const getGeminiUrl = () => {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const generateGeminiResponse = async (prompt) => {
  const url = getGeminiUrl();
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 16384,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Gemini attempt ${attempt} failed (${response.status}):`, err.slice(0, 300));
      const retryable = [429, 500, 502, 503].includes(response.status);
      if (!retryable || attempt === 3) {
        throw new ApiError(502, `Gemini API Error (${response.status}): ${err.slice(0, 150)}`);
      }
      await wait(attempt * 2000);
      continue;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (text) {
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        return JSON.parse(cleanText);
      } catch {
        console.error(
          `Gemini attempt ${attempt} invalid JSON (finishReason: ${candidate?.finishReason}), tail:`,
          cleanText.slice(-200),
        );
      }
    } else {
      console.error(`Gemini attempt ${attempt}: no text (finishReason: ${candidate?.finishReason})`);
    }

    if (attempt === 3) {
      throw new ApiError(502, "Gemini returned an invalid response, please try again");
    }
    await wait(attempt * 2000);
  }
};
