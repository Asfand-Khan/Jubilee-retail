import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import { createLeadInfoHandler, getAllLeadInfoHandler, updateLeadInfoStatusHandler } from "../controllers/leadInfoController";

const router = Router();

router.post("/all", authenticate, getAllLeadInfoHandler); // Get All Motor Quotes --> Protected
router.post("/", authenticateApiUser, createLeadInfoHandler); // Create Motor Quotes --> Protected
router.post("/status", authenticate, updateLeadInfoStatusHandler); // Update Lead Info Status --> Protected
// router.put("/", authenticate, updateMotorQuoteHandler); // Update Motor Quotes --> Protected

export default router;