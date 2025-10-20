import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/leadMotorInfoController";

const router = Router();

router.post("/all", authenticate, controller.getAllLeadMotorInfoHandler); // Get All Motor Quotes --> Protected
router.post("/", authenticateApiUser, controller.createLeadMotorInfoHandler); // Create Motor Quotes --> Protected
router.post("/status", authenticate, controller.updateLeadMotorInfoStatusHandler); // Update Lead Info Status --> Protected

export default router;
