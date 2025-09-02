import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/paymentModeController";

const router = Router();

router.get("/", authenticate, controller.getAllPaymentModeHandler); // Get All Payment Modes --> Protected
router.post("/", authenticate, controller.createPaymentModeHandler); // Create Payment Modes --> Protected
router.post("/single", authenticate, controller.singlePaymentModeHandler); // Get Single Payment Mode --> Protected
router.put("/", authenticate, controller.updatePaymentModeHandler); // Update Payment Modes --> Protected

export default router;