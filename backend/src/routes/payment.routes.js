import { Router } from "express";
import { checkout, processMockPayment } from "../controllers/payment.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.post("/checkout", isAuth, checkout);
router.post("/process-mock", isAuth, processMockPayment);

export default router;
