import { Response, Request } from "express";
import { createPDF } from "./pdfBuilder";
import { addFooter } from "./sections/footer";
import QRCode from "qrcode";
import { healthCarePdf } from "./healthCarePdf";
import { Prisma } from "@prisma/client";
import { viaCarePdf } from "./viaCarePdf";
import { homeCarePdf } from "./homeCarePdf";
import { selfCarePdf } from "./selfCarePdf";
import { purchaseProtectionPdf } from "./purchaseProtectionPdf";
import { encodeOrderCode } from "../base64Url";

export type FullOrder = Prisma.OrderGetPayload<{
  include: {
    Policy: {
      include: {
        plan: true;
        product: {
          include: {
            productCategory: true;
          };
        };
        PolicyTravel: true;
        PolicyHomecare: true;
        PolicyPurchaseProtection: true;
        policyDetails: true;
        FblPolicyRider: true;
        apiUser: true;
        productOption: {
          include: {
            webappMappers: true;
          };
        };
      };
    };
    payemntMethod: true;
  };
}>;

export type FullPolicy = FullOrder["Policy"][0];

export async function generateOrderPDF(
  res: Response,
  order: FullOrder,
  req: Request
): Promise<void> {
  const policy =
    order.Policy && order.Policy.length > 0 ? order.Policy[0] : null;
  const product = policy ? policy.product : null;
  const productType = policy ? policy.product.product_type : "general";

  let qrImageUrl = "";
  const token = encodeOrderCode(order.order_code);
  const qrData = `${process.env.BASE_URL}/policyDoc/${token}.pdf`;
  try {
    qrImageUrl = await QRCode.toDataURL(qrData, { type: "image/png" });
  } catch (err) {
    console.error("Error generating QR code:", err);
    qrImageUrl = "";
  }

  const doc = createPDF(res, `${order.order_code}`);

  order.Policy.forEach((policy) => {
    if (productType === "travel") {
      viaCarePdf(doc, policy, order, qrImageUrl);
    } else if (productType === "health") {
      if (
        product?.product_name.toLowerCase().includes("selfcare") ||
        product?.product_name.toLowerCase().includes("self care")
      ) {
        selfCarePdf(doc, policy, order, qrImageUrl);
      } else if (product?.product_name.toLowerCase().includes("accident")) {
        selfCarePdf(doc, policy, order, qrImageUrl);
      } else {
        healthCarePdf(doc, policy, order, qrImageUrl);
      }
    } else if (productType === "home") {
      homeCarePdf(doc, policy, order, qrImageUrl);
    } else if (productType === "purchase_protection") {
      purchaseProtectionPdf(doc, policy, order, qrImageUrl);
    }
  });

  doc.end();
}
