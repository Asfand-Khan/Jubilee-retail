import { Response } from "express";
import { createPDF } from "./pdfBuilder";
import { addScheduleHeader } from "./sections/header";
import { addBenefitPlansTable, addInsuredDetailsTable, addPolicyDetailsTable } from "./sections/tables";
import { addHealthDetails, addProgramDetails, addSponsorDetails, addTravelDetails } from "./sections/specializedSections";
import { addDeclarationsAndExclusions } from "./sections/declarations";
import { addVerificationAndQR } from "./sections/verification";
import { addAssistanceContacts } from "./sections/contacts";
import { addFooter } from "./sections/footer";
import QRCode from "qrcode";

export async function generateOrderPDF(res: Response, order: any): Promise<void> {
    const policy = order.Policy && order.Policy.length > 0 ? order.Policy[0] : null;
    let qrImageUrl = "";
    const qrData = `Verification code: ${policy ? policy.policy_code : "123-456-7890"}`;
    try {
        qrImageUrl = await QRCode.toDataURL(qrData, { type: 'image/png' });
    } catch (err) {
        console.error("Error generating QR code:", err);
        qrImageUrl = ""; // Fallback to empty if generation fails
    }

    const doc = createPDF(res, `${order.order_code}`);

    addScheduleHeader(doc, order);

    order.Policy.forEach((policy: any) => {
        addPolicyDetailsTable(doc, policy);
        addInsuredDetailsTable(doc, policy);

        // Dynamically add based on product type
        if (policy.product.product_type === "travel") {
            addTravelDetails(doc, policy.PolicyTravel);
            addProgramDetails(doc, policy.PolicyTravel);
            addSponsorDetails(doc, policy.PolicyTravel);
        } else if (policy.product.product_type === "health") {
            addHealthDetails(doc, policy);
        }
        // Extend for other types like homecare, etc.

        // addBenefitPlansTable(doc, policy);
        addDeclarationsAndExclusions(doc, policy);
        addVerificationAndQR(doc, policy, qrImageUrl);
        // addAssistanceContacts(doc, policy);
    });

    addFooter(doc);
    doc.end();
}