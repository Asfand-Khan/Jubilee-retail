import { Router } from "express";
import {
  authenticateApiUser,
  authenticate,
} from "../middleware/authMiddleware";
import * as controller from "../controllers/orderController";
import prisma from "../config/db";
import { generateOrderPDF } from "../utils/pdf";

const router = Router();

router.post("/", authenticateApiUser, controller.createOrderHandler); // Create Order --> Protected
router.put("/", authenticate, controller.updateOrderHandler); // Update Order --> Protected
router.post(
  "/cc-transaction",
  authenticateApiUser,
  controller.ccTransactionHandler
); // Verify CC Transaction --> Protected
router.post("/repush", authenticate, controller.repushOrderHandler); // Repush the order to blueEx --> Protected
router.post(
  "/verify-manually",
  authenticate,
  controller.manuallyVerifyCCHandler
); // Manually Verify CC Order --> Protected
router.post("/list", authenticate, controller.fetchOrderListHandler); // Fetch List --> Protected
router.post("/single", authenticate, controller.singleOrderHandler); // Fetch Single Order --> Protected
router.post("/generate-his", authenticate, controller.generateHISHandler); // Generate HIS CBO File --> Protected
router.post("/bulk", authenticate, controller.bulkOrderHandler); // Create Bulk Order --> Protected
router.post("/status", authenticate, controller.orderPolicyStatusHandler); // Manually Verify CC Order --> Protected

router.get("/:order_code/pdf", async (req, res): Promise<any> => {
  const { order_code } = req.params;

  const order = await prisma.order.findUnique({
    where: { order_code },
    include: {
      Policy: {
        include: {
          plan: true,
          product: { include: { productCategory: true } },
          PolicyTravel: true,
          PolicyHomecare: true,
          PolicyPurchaseProtection: true,
          policyDetails: true,
          FblPolicyRider: true,
          apiUser: true,
          productOption: {
            include: { webappMappers: true },
          },
        },
      },
      payemntMethod: true,
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await generateOrderPDF(res, order, req);
});

export default router;
