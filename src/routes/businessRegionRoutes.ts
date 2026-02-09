import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createBusinessRegionHandler, getAllBusinessRegionsHandler, getSingleBusinessRegionHandler, updateBusinessRegionHandler } from "../controllers/businessRegionController";

const router = Router();

router.get("/", authenticate, getAllBusinessRegionsHandler); // Get All Business Regions --> Protected
router.post("/", authenticate,checkUserRights(17,'can_create'), createBusinessRegionHandler); // Create Business Regions --> Protected
router.get("/:id", authenticate, getSingleBusinessRegionHandler); // Single Business Regions --> Protected
router.put("/", authenticate,checkUserRights(17,'can_edit'), updateBusinessRegionHandler); // Update Business Regions --> Protected

export default router;