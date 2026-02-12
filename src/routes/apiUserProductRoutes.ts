import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
  checkUserRights,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/apiUserProductController";

const router = Router();

router.post("/all", authenticate, checkUserRights(45,'can_view'), controller.getAllApiUserProductHandler); // Get All Api User Products --> Protected
router.post("/", authenticate,checkUserRights(45,'can_create'), controller.createApiUserProductHandler); // Create Api User Product --> Protected
router.post("/single", authenticate,checkUserRights(45,'can_view'), controller.singleApiUserProductHandler); // Get Api User Product By Api User Id --> Protected
router.put("/", authenticate,checkUserRights(45,'can_edit'), controller.updateApiUserProductHandler); // Update Api User Product By Api User Id --> Protected
router.post("/single/external", authenticateApiUser, controller.singleApiUserProductForExternalUserHandler); // Single Api User Products For External User --> Protected
router.post("/single/internal", authenticate, controller.singleApiUserProductForInternalUserHandler); // Single Api User Products For External User --> Protected

// router.post("/status", authenticate, controller.updateLeadMotorInfoStatusHandler); // Update Lead Info Status --> Protected

export default router;