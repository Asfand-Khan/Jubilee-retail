import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/couponController";

const router = Router();

router.post("/all", authenticate, controller.getAllCouponsHandler); // Get All Coupons --> Protected
router.post("/get", authenticateApiUser, controller.getCouponHandler); // Get Coupon Protections --> Protected
router.post("/", authenticate, controller.createCouponHandler); // Create Coupon --> Protected
// router.post("/single", authenticate,controller.getSinglePremiumRangeProtectionHandler); // Get Single Premium Range Protections --> Protected
// router.put("/", authenticate, controller.updatePremiumRangeProtectionHandler); // Update Premium Range Protections --> Protected

export default router;
