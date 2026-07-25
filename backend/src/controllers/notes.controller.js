import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.model.js";
import Notes from "../models/notes.model.js";
import { buildPrompt, buildQuizPrompt } from "../utils/promptBuilder.js";
import { generateGeminiResponse } from "../services/gemini.services.js";

const generateNotes = asyncHandler(async (req, res) => {
  const {
    topic,
    subject,
    detail,
    revisionMode,
    includeDiagrams,
    includeCharts,
  } = req.body;

  // Input Validation: Topic required & length limits
  if (typeof topic !== "string" || !topic.trim()) {
    throw new ApiError(400, "Topic is required and must be text");
  }
  if (topic.trim().length > 300) {
    throw new ApiError(400, "Topic cannot exceed 300 characters");
  }
  if (subject && (typeof subject !== "string" || subject.trim().length > 150)) {
    throw new ApiError(400, "Subject cannot exceed 150 characters");
  }

  // Atomic Credit Check & Deduction (Race Condition & Double-Spend Protection)
  const user = await User.findOneAndUpdate(
    { _id: req.userId, credits: { $gte: 10 } },
    { $inc: { credits: -10 } },
    { new: true }
  );

  if (!user) {
    const checkUser = await User.findById(req.userId);
    if (!checkUser) {
      throw new ApiError(401, "Unauthorized: user not found");
    }
    throw new ApiError(
      403,
      "You need at least 10 credits to generate notes. Please buy more to continue."
    );
  }

  const prompt = buildPrompt({
    topic: topic.trim(),
    subject: subject?.trim(),
    detail,
    revisionMode,
    includeDiagrams,
    includeCharts,
  });

  let content;
  try {
    content = await generateGeminiResponse(prompt);
  } catch (err) {
    // Refund credits if Gemini AI generation fails
    await User.findByIdAndUpdate(req.userId, { $inc: { credits: 10 } });
    throw new ApiError(500, "Failed to generate notes with AI. Credits refunded.");
  }

  const note = await Notes.create({
    user: user._id,
    topic: topic.trim(),
    subject: subject?.trim(),
    detail,
    revisionMode,
    includeDiagrams,
    includeCharts,
    content,
  });

  user.isCreditAvailable = user.credits > 0;
  user.notes.push(note._id);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { note, credits: user.credits }));
});

const getMyNotes = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const notes = await Notes.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { notes }));
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Notes.findOneAndDelete({
    _id: req.params.id,
    user: req.userId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  await User.findByIdAndUpdate(req.userId, { $pull: { notes: note._id } });

  return res.status(200).json(new ApiResponse(200, null, "Note deleted"));
});

const generateQuiz = asyncHandler(async (req, res) => {
  const note = await Notes.findOne({ _id: req.params.id, user: req.userId });
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (note.quiz) {
    const user = await User.findById(req.userId);
    return res
      .status(200)
      .json(new ApiResponse(200, { quiz: note.quiz, credits: user?.credits || 0, cached: true }));
  }

  // Atomic Credit Check & Deduction for Quiz (5 Credits)
  const user = await User.findOneAndUpdate(
    { _id: req.userId, credits: { $gte: 5 } },
    { $inc: { credits: -5 } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(
      403,
      "You need at least 5 credits to generate a quiz. Please buy more to continue."
    );
  }

  const prompt = buildQuizPrompt({
    topic: note.topic,
    notes: note.content?.notes || "",
    subTopics: note.content?.subTopics,
  });

  let result;
  try {
    result = await generateGeminiResponse(prompt);
  } catch (err) {
    // Refund credits if AI generation fails
    await User.findByIdAndUpdate(req.userId, { $inc: { credits: 5 } });
    throw new ApiError(500, "Could not generate a quiz. Credits refunded.");
  }

  if (!result?.questions?.length) {
    await User.findByIdAndUpdate(req.userId, { $inc: { credits: 5 } });
    throw new ApiError(502, "Could not generate a quiz, please try again. Credits refunded.");
  }

  note.quiz = result;
  note.markModified("quiz");
  await note.save();

  user.isCreditAvailable = user.credits > 0;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { quiz: result, credits: user.credits }));
});

export { generateNotes, getMyNotes, deleteNote, generateQuiz };
