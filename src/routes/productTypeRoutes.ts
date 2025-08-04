import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createProductTypeHandler, getAllProductTypesHandler, getSingleProductTypeHandler, updateProductTypeHandler } from "../controllers/productTypeController";

const router = Router();

router.get("/", authenticate, getAllProductTypesHandler); // Get All ProductType --> Protected
router.post("/", authenticate, createProductTypeHandler); // Create ProductType --> Protected
router.post("/single", authenticate, getSingleProductTypeHandler); // Single ProductType --> Protected
router.put("/", authenticate, updateProductTypeHandler); // Update ProductType --> Protected

export default router;