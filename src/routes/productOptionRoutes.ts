import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createProductOptionHandler, getAllProductOptionsHandler, getSingleProductOptionHandler, updateProductOptionHandler } from "../controllers/productOptionController";

const router = Router();

router.get("/", authenticate, getAllProductOptionsHandler); // Get All Product Option --> Protected
router.post("/", authenticate,checkUserRights(37,'can_create'), createProductOptionHandler); // Create Product Option --> Protected
router.post("/single", authenticate, getSingleProductOptionHandler); // Single Product Option --> Protected
router.put("/", authenticate,checkUserRights(37,'can_edit'), updateProductOptionHandler); // Update Product Option --> Protected

export default router;