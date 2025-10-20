import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createProductHandler,
  getAllProductsHandler,
  getSingleProductHandler,
  updateProductHandler,
} from "../controllers/productController";

const router = Router();

router.post("/all", authenticate, getAllProductsHandler); // Get All Product --> Protected
router.post("/", authenticate, createProductHandler); // Create Product --> Protected
router.post("/single", authenticate, getSingleProductHandler); // Single Product --> Protected
router.put("/", authenticate, updateProductHandler); // Update Product --> Protected

export default router;
