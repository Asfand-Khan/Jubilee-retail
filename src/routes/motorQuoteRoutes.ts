import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
  checkUserRights,
} from "../middleware/authMiddleware";
import {
  createMotorQuoteHandler,
  getAllMotorQuotesHandler,
  getSingleMotorQuoteHandler,
  updateMotorQuoteHandler,
  updateMotorQuoteStatusHandler,
} from "../controllers/motorQuoteController";

const router = Router();

router.post("/all", authenticate, getAllMotorQuotesHandler); // Get All Motor Quotes --> Protected
router.post("/", authenticateApiUser, createMotorQuoteHandler); // Create Motor Quotes --> Protected
router.post("/status", authenticate,checkUserRights(32,'can_edit'), updateMotorQuoteStatusHandler); // Update Motor Quote Status --> Protected
router.get("/:id", authenticate, getSingleMotorQuoteHandler); // Single Motor Quotes --> Protected
router.put("/", authenticate,checkUserRights(32,'can_edit'), updateMotorQuoteHandler); // Update Motor Quotes --> Protected

export default router;
