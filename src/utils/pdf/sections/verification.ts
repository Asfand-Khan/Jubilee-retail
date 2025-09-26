import PDFDocument from "pdfkit";

export function addVerificationAndQR(doc: InstanceType<typeof PDFDocument>, policy: any, qrImageUrl: string) {
    console.log("Qr section...");
    // Set up a two-column layout to match Picture 01
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height; // 841.89 for A4
    const margin = 20;
    const columnWidth = (pageWidth) / 2;
    let yStart = doc.y;

    // Left column: Verification text
    doc.font("Helvetica-Bold").fontSize(9).text("This is a digitally signed copy of the Policy which may be verified", margin, yStart + 10, {
        underline: true
    });
    doc.text("for authenticity by logging on to our website", margin, yStart + 20, { underline: true });
    doc.font("Helvetica").text("https://jubileegeneral.com.pk/getinsurance/policy-verification", margin, yStart + 35);
    doc.text("Issued by Retail Business Division", margin, yStart + 55);

    doc.image(qrImageUrl, doc.page.width - margin - 60, yStart, { width: 60, height: 60 });
    // Adjust text positions based on current y after image
    doc.text(`Verification code: ${policy.policy_code || "123-456-7890"}`, margin + columnWidth + 30, doc.y - 8, {
        underline: true,
        align: "right"
    });
    doc.text("Digitally signed for & on behalf of JUBILEE GENERAL INSURANCE COMPANY LIMITED", margin + columnWidth + 30, doc.y + 5,{
        align: "right"
    });
    
    doc.moveDown(2);
}