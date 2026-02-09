import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
  checkUserRights,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/paymentModeController";

const router = Router();

router.get("/", authenticate, controller.getAllPaymentModeHandler); // Get All Payment Modes --> Protected
router.post("/", authenticate,checkUserRights(50,'can_edit'), controller.createPaymentModeHandler); // Create Payment Modes --> Protected
router.post("/single", authenticate, controller.singlePaymentModeHandler); // Get Single Payment Mode --> Protected
router.put("/", authenticate,checkUserRights(50,'can_edit'), controller.updatePaymentModeHandler); // Update Payment Modes --> Protected

export default router;