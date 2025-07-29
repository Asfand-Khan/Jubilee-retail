import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createProductCategoryHandler, getAllProductCategoriesHandler, getSingleProductCategoryHandler, updateProductCategoryHandler } from "../controllers/productCategoryController";

const router = Router();

router.get("/", authenticate, getAllProductCategoriesHandler); // Get All ProductCategory --> Protected
router.post("/", authenticate, createProductCategoryHandler); // Create ProductCategory --> Protected
router.post("/single", authenticate, getSingleProductCategoryHandler); // Single ProductCategory --> Protected
router.put("/", authenticate, updateProductCategoryHandler); // Update ProductCategory --> Protected

export default router;