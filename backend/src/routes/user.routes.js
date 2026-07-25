import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.get("/me", isAuth, getCurrentUser);

export default router;
