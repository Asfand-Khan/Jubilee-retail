import { Router } from "express";
import prisma from "../config/db";
import { generateOrderPDF } from "../utils/pdf";
import { decodeOrderCode } from "../utils/base64Url";

const router = Router();

router.get("/:token.pdf", async (req, res): Promise<any> => {
  const { token } = req.params;
  const order_code = decodeOrderCode(token);
  if (!order_code) {
    return res.status(404).send("Invalid or expired policy link");
  }
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
