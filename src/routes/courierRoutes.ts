import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createCourierHandler, getAllCouriersHandler, getSingleCourierHandler, updateCourierHandler } from "../controllers/courierController";

const router = Router();

router.get("/", authenticate, getAllCouriersHandler); // Get All Couriers --> Protected
router.post("/", authenticate, checkUserRights(16,'can_create'),createCourierHandler); // Create Couriers --> Protected
router.get("/:id", authenticate, getSingleCourierHandler); // Single Couriers --> Protected
router.put("/", authenticate,checkUserRights(16,'can_edit'), updateCourierHandler); // Update Couriers --> Protected

export default router;