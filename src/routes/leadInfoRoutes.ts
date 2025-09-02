import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/leadInfoController";

const router = Router();

router.get("/", authenticate, controller.getAllLeadInfoHandler); // Get All Motor Quotes --> Protected
router.post("/", authenticateApiUser, controller.createLeadInfoHandler); // Create Motor Quotes --> Protected
router.post("/status", authenticate, controller.updateLeadInfoStatusHandler); // Update Lead Info Status --> Protected
// router.put("/", authenticate, updateMotorQuoteHandler); // Update Motor Quotes --> Protected

export default router;