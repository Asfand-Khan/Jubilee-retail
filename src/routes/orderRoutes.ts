import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/orderController";

const router = Router();

// router.get("/", authenticateApiUser, controller.getAllCouponsHandler); // Get All Orders --> Protected
router.post("/", authenticateApiUser, controller.createOrderHandler); // Create Order --> Protected
router.post("/cc-transaction", authenticateApiUser, controller.ccTransactionHandler); // Verify CC Transaction --> Protected
// router.post("/", authenticateApiUser, controller.createCouponHandler); // Create Coupon --> Protected

export default router;
