import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import * as controller from "../controllers/dashboardController";

const router = Router();

router.post("/policy-stats", authenticate, controller.getPolicyStatsHandler);
router.post(
  "/top-5-products-detail-wise",
  authenticate,
  controller.getTop5ProductsDetailWiseHandler
);
router.post(
  "/top-5-products-by-product-amount",
  authenticate,
  controller.getTop5ProductsByProductAmountHandler
);
router.post(
  "/top-5-api-users-by-policy-amount",
  authenticate,
  controller.getTop5ApiUsersByPolicyAmountHandler
);
router.post(
  "/monthly-orders-and-policies",
  authenticate,
  controller.getMonthlyOrdersAndPoliciesHandler
);
router.post(
  "/product-share-of-policy-amount-by-amount",
  authenticate,
  controller.getProductShareOfPolicyAmountByAmountHandler
);
router.post(
  "/policy-status-breakdown-valid-invalid",
  authenticate,
  controller.getPolicyStatusBreakdownValidInvalidHandler
);
router.post("/recent-orders", authenticate, controller.getRecentOrdersHandler);
router.post("/top-5-agents", authenticate, controller.getTop5AgentsHandler);
router.post("/top-5-branches", authenticate, controller.getTop5BranchesHandler);
router.post("/coupon-usage", authenticate, controller.getCouponUsageHandler);
router.post("/payment-mode", authenticate, controller.getPaymentModeHandler);

export default router;
