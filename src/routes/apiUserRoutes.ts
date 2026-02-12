import { Router } from "express";
import {
  getApiUserProfiles,
  updateApiUserCreds,
} from "../controllers/userController";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, checkUserRights(4,'can_view'),getApiUserProfiles); // Get All API Users --> Protected
router.get("/:id", checkUserRights(4,'can_edit'),authenticate, updateApiUserCreds); // Update API User Credentials --> Protected

export default router;