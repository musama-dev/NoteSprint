import { Router } from "express";
import { generateNotes, getMyNotes, deleteNote, generateQuiz } from "../controllers/notes.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.post("/generate", isAuth, generateNotes);
router.get("/my-notes", isAuth, getMyNotes);
router.delete("/:id", isAuth, deleteNote);
router.post("/:id/quiz", isAuth, generateQuiz);

export default router;
