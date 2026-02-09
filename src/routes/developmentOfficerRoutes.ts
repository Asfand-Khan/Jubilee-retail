import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createDOHandler, getAllDOsHandler, getSingleDOHandler, updateDOHandler } from "../controllers/developmentOfficerController";

const router = Router();

router.post("/all", authenticate, getAllDOsHandler); // Get All Development Officers --> Protected
router.post("/", authenticate,checkUserRights(8,'can_create'), createDOHandler); // Create Development Officers --> Protected
router.get("/:id", authenticate, getSingleDOHandler); // Single Development Officers --> Protected
router.put("/", authenticate,checkUserRights(8,'can_edit'), updateDOHandler); // Update Development Officers --> Protected

export default router;