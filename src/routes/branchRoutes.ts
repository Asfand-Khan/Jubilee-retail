import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createBranchHandler, getAllBranchesHandler, getSingleBranchHandler, updateBranchHandler } from "../controllers/branchController";

const router = Router();

router.get("/", authenticate, getAllBranchesHandler); // Get All Branches --> Protected
router.post("/", authenticate, createBranchHandler); // Create Branch --> Protected
router.get("/:id", authenticate, getSingleBranchHandler); // Single Branch --> Protected
router.put("/", authenticate, updateBranchHandler); // Update Branch --> Protected

export default router;