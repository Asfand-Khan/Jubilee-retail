import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import {
  createMotorQuoteHandler,
  getAllMotorQuotesHandler,
  getSingleMotorQuoteHandler,
  updateMotorQuoteHandler,
} from "../controllers/motorQuoteController";

const router = Router();

router.get("/", authenticate, getAllMotorQuotesHandler); // Get All Motor Quotes --> Protected
router.post("/", authenticateApiUser, createMotorQuoteHandler); // Create Motor Quotes --> Protected
router.get("/:id", authenticate, getSingleMotorQuoteHandler); // Single Motor Quotes --> Protected
router.put("/", authenticate, updateMotorQuoteHandler); // Update Motor Quotes --> Protected

export default router;
