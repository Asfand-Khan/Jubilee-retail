import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createCallUsDataHandler, getAllCallUsDataHandler, getSingleCallUsDataHandler, updateCallUsDataHandler } from "../controllers/callUsDataController";

const router = Router();

router.post("/all", authenticate, getAllCallUsDataHandler); // Get All CallUsData --> Protected
router.post("/", authenticate, createCallUsDataHandler); // Create CallUsData --> Protected
router.get("/:id", authenticate, getSingleCallUsDataHandler); // Single CallUsData --> Protected
router.put("/", authenticate, updateCallUsDataHandler); // Update CallUsData --> Protected

export default router;