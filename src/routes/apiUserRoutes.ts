import { Router } from "express";
import {
  getApiUserProfiles,
  updateApiUserCreds,
} from "../controllers/userController";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getApiUserProfiles); // Get All API Users --> Protected
router.get("/:id", authenticate, updateApiUserCreds); // Update API User Credentials --> Protected

export default router;