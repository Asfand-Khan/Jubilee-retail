import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createCourierHandler, getAllCouriersHandler, getSingleCourierHandler, updateCourierHandler } from "../controllers/courierController";

const router = Router();

router.get("/", authenticate, getAllCouriersHandler); // Get All Couriers --> Protected
router.post("/", authenticate, createCourierHandler); // Create Couriers --> Protected
router.get("/:id", authenticate, getSingleCourierHandler); // Single Couriers --> Protected
router.put("/", authenticate, updateCourierHandler); // Update Couriers --> Protected

export default router;