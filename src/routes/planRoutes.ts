import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createPlanHandler, getAllPlansHandler, getSinglePlanHandler, updatePlanHandler } from "../controllers/planController";

const router = Router();

router.get("/", authenticate, getAllPlansHandler); // Get All Plan --> Protected
router.post("/", authenticate,checkUserRights(34,'can_create'), createPlanHandler); // Create Plan --> Protected
router.post("/single", authenticate, getSinglePlanHandler); // Single Plan --> Protected
router.put("/", authenticate,checkUserRights(34,'can_edit'), updatePlanHandler); // Update Plan --> Protected

export default router;