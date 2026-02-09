import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
  checkUserRights,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/premiumRangeProtectionController";

const router = Router();

router.get("/", authenticate, controller.getAllPremiumRangeProtectionsHandler); // Get All Premium Range Protections --> Protected
router.post("/", authenticate,checkUserRights(49,'can_create'),controller.createPremiumRangeProtectionHandler); // Create Premium Range Protections --> Protected
router.post("/single", authenticate,controller.getSinglePremiumRangeProtectionHandler); // Get Single Premium Range Protections --> Protected
router.put("/", authenticate, checkUserRights(49,'can_edit'),controller.updatePremiumRangeProtectionHandler); // Update Premium Range Protections --> Protected

export default router;
