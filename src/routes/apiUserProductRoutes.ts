import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/apiUserProductController";

const router = Router();

router.get("/", authenticate, controller.getAllApiUserProductHandler); // Get All Api User Products --> Protected
router.post("/", authenticate, controller.createApiUserProductHandler); // Create Api User Product --> Protected
router.post("/single", authenticate, controller.singleApiUserProductHandler); // Get Api User Product By Api User Id --> Protected
router.put("/", authenticate, controller.updateApiUserProductHandler); // Update Api User Product By Api User Id --> Protected
// router.post("/", authenticateApiUser, controller.createLeadMotorInfoHandler); // Create Motor Quotes --> Protected
// router.post("/status", authenticate, controller.updateLeadMotorInfoStatusHandler); // Update Lead Info Status --> Protected

export default router;