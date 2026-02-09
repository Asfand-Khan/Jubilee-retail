import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createBranchHandler, getAllBranchesHandler, getSingleBranchHandler, updateBranchHandler } from "../controllers/branchController";

const router = Router();

router.post("/all", authenticate, getAllBranchesHandler); // Get All Branches --> Protected
router.post("/", authenticate,checkUserRights(6,'can_create'), createBranchHandler); // Create Branch --> Protected
router.get("/:id", authenticate, getSingleBranchHandler); // Single Branch --> Protected
router.put("/", authenticate,checkUserRights(6,'can_edit'), updateBranchHandler); // Update Branch --> Protected

export default router;