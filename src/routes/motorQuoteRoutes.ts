import { Router } from "express";
import { authenticateApiUser, checkUserRights } from "../middleware/authMiddleware";
import { createMotorQuoteHandler, getAllMotorQuotesHandler, getSingleMotorQuoteHandler, updateMotorQuoteHandler } from "../controllers/motorQuoteController";

const router = Router();

router.get("/", authenticateApiUser, getAllMotorQuotesHandler); // Get All Motor Quotes --> Protected
router.post("/", authenticateApiUser, createMotorQuoteHandler); // Create Motor Quotes --> Protected
router.get("/:id", authenticateApiUser, getSingleMotorQuoteHandler); // Single Motor Quotes --> Protected
router.put("/", authenticateApiUser, updateMotorQuoteHandler); // Update Motor Quotes --> Protected

export default router;