import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/premiumRangeProtectionController";

const router = Router();

router.get("/", authenticate, controller.getAllPremiumRangeProtectionsHandler); // Get All Premium Range Protections --> Protected
router.post("/", authenticate,controller.createPremiumRangeProtectionHandler); // Create Premium Range Protections --> Protected
router.post("/single", authenticate,controller.getSinglePremiumRangeProtectionHandler); // Get Single Premium Range Protections --> Protected
router.put("/", authenticate, controller.updatePremiumRangeProtectionHandler); // Update Premium Range Protections --> Protected

export default router;
