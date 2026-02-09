import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createProductTypeHandler, getAllProductTypesHandler, getSingleProductTypeHandler, updateProductTypeHandler } from "../controllers/productTypeController";

const router = Router();

router.get("/", authenticate, getAllProductTypesHandler); // Get All ProductType --> Protected
router.post("/", authenticate,checkUserRights(38,'can_create'), createProductTypeHandler); // Create ProductType --> Protected
router.post("/single", authenticate, getSingleProductTypeHandler); // Single ProductType --> Protected
router.put("/", authenticate,checkUserRights(38,'can_edit'), updateProductTypeHandler); // Update ProductType --> Protected

export default router;