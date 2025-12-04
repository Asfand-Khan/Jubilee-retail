import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from "..";

export function addVerificationAndQR(doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder, qrImageUrl: string, isFranchiseOrder: boolean) {
    console.log("Qr section...");
    // Set up a two-column layout to match Picture 01
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height; // 841.89 for A4
    const margin = 20;
    const columnWidth = (pageWidth) / 2;
    let yStart = doc.y;

    let policyWord = "Policy";
    let websiteLink = `${process.env.POLICY_VERIFICATION_INSURANCE}`;
    let retailBranch = "";
    let takafulWindowText = "Digitally signed for & on behalf of\nJUBILEE GENERAL INSURANCE COMPANY LIMITED";
    if (policy.takaful_policy) {
        policyWord = "PMD";
        websiteLink = `${process.env.POLICY_VERIFICATION_TAKAFUL}`;
        retailBranch = "Takaful";
        takafulWindowText = "Digitally signed for & on behalf of\nJUBILEE GENERAL INSURANCE COMPANY\nLIMITED WINDOW TAKAFUL OPERATIONS";
    }
    let verification = "This is a digitally signed copy of the " + policyWord + " which may be verified\n for authenticity by logging on to our website\n";
    if (isFranchiseOrder) {
        verification = "PMD verification";
    }

    // Left column: Verification text
    doc.font("Helvetica-Bold").fontSize(9).text(verification, margin, yStart + 10, {
        underline: true
    });
    // doc.text("for authenticity by logging on to our website", margin, yStart + 20, { underline: true });
    doc.font("Helvetica").text(websiteLink, margin, yStart + 35);
    doc.text("Issued by " + retailBranch + " Retail Business Division", margin, yStart + 55);

    doc.image(qrImageUrl, doc.page.width - margin - 60, yStart, { width: 60, height: 60 });
    // Adjust text positions based on current y after image
    doc.text(`Verification code: ${policy.policy_code || "123-456-7890"}`, margin + columnWidth + 30, doc.y - 8, {
        underline: true,
        align: "right"
    });
    doc.text(takafulWindowText, margin + columnWidth + 30, doc.y + 5, {
        align: "right"
    });

    doc.moveDown(2);
}