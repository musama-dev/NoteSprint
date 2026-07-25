import { Router } from "express";
import { checkout } from "../controllers/payment.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.post("/checkout", isAuth, checkout);

export default router;
