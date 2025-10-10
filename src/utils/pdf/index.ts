import { Response, Request } from "express";
import { createPDF } from "./pdfBuilder";
import { addFooter } from "./sections/footer";
import QRCode from "qrcode";
import { healthCarePdf } from "./healthCarePdf";
import { Prisma } from "@prisma/client";
import { viaCarePdf } from "./viaCarePdf";
import { homeCarePdf } from "./homeCarePdf";
import { selfCarePdf } from "./selfCarePdf";

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
        payemntMethod: true
    };
}>;

export type FullPolicy = FullOrder["Policy"][0];

export async function generateOrderPDF(res: Response, order: FullOrder, req: Request): Promise<void> {
    const policy = order.Policy && order.Policy.length > 0 ? order.Policy[0] : null;
    const product = policy ? policy.product : null;
    const productType = policy ? policy.product.product_type : "general";

    let qrImageUrl = "";
    const qrData = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/orders/${order.order_code}/pdf`;
    try {
        qrImageUrl = await QRCode.toDataURL(qrData, { type: 'image/png' });
    } catch (err) {
        console.error("Error generating QR code:", err);
        qrImageUrl = "";
    }

    const doc = createPDF(res, `${order.order_code}`);

    order.Policy.forEach((policy) => {
        if (productType === "travel") {
            if (
                (product?.product_name.toLowerCase().includes("selfcare")) ||
                (product?.product_name.toLowerCase().includes("self care"))
            ) {
                selfCarePdf(doc, policy, order, qrImageUrl)
            } else {
                viaCarePdf(doc, policy, order, qrImageUrl);
            }
        } else if (productType === "health") {
            healthCarePdf(doc, policy, order);
        } else if (productType === "home") {
            homeCarePdf(doc, policy, order, qrImageUrl);
        }
    });

    doc.end();
}