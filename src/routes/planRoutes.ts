import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createPlanHandler, getAllPlansHandler, getSinglePlanHandler, updatePlanHandler } from "../controllers/planController";

const router = Router();

router.get("/", authenticate, getAllPlansHandler); // Get All Plan --> Protected
router.post("/", authenticate, createPlanHandler); // Create Plan --> Protected
router.post("/single", authenticate, getSinglePlanHandler); // Single Plan --> Protected
router.put("/", authenticate, updatePlanHandler); // Update Plan --> Protected

export default router;