import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createProductCategoryHandler, getAllProductCategoriesHandler, getSingleProductCategoryHandler, updateProductCategoryHandler } from "../controllers/productCategoryController";

const router = Router();

router.get("/", authenticate, getAllProductCategoriesHandler); // Get All ProductCategory --> Protected
router.post("/", authenticate, checkUserRights(35,'can_create'),createProductCategoryHandler); // Create ProductCategory --> Protected
router.post("/single", authenticate, getSingleProductCategoryHandler); // Single ProductCategory --> Protected
router.put("/", authenticate,checkUserRights(35,'can_edit'), updateProductCategoryHandler); // Update ProductCategory --> Protected

export default router;