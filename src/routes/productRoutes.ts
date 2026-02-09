import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import {
  createProductHandler,
  getAllProductsHandler,
  getSingleProductHandler,
  updateProductHandler,
} from "../controllers/productController";

const router = Router();

router.post("/all", authenticate, getAllProductsHandler); // Get All Product --> Protected
router.post("/", authenticate,checkUserRights(36,'can_create'), createProductHandler); // Create Product --> Protected
router.post("/single", authenticate, getSingleProductHandler); // Single Product --> Protected
router.put("/", authenticate, checkUserRights(36,'can_edit'),updateProductHandler); // Update Product --> Protected

export default router;
