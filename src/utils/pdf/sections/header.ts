import PDFDocument from "pdfkit";

export function addScheduleHeader(doc: InstanceType<typeof PDFDocument>, order: any) {
    const pageWidth = doc.page.width;
    const margin = 20;
    const logoWidth = 65;
    const logoY = margin;
    const leftLogoX = margin;
    const rightLogoX = pageWidth - margin - logoWidth;

    const policy = order.Policy && order.Policy.length > 0 ? order.Policy[0] : null;

    // Main Jubilee logo
    const mainLogoPath = policy && policy.takaful_policy ? `${__dirname}../../../../../assets/logo/takaful_logo.png` : `${__dirname}../../../../../assets/logo/insurance_logo.png`;
    doc.image(mainLogoPath, leftLogoX, logoY, { width: logoWidth });

    let secondaryLogoPath = `${__dirname}../../../../../assets/logo/jubilee_logo.png`; // Default Secondary Logo

    // Optional: Customize based on type to match samples (commented; uncomment if separate assets available)
    const policyType = order.Policy[0]?.product.product_type;
    const productName = order.Policy[0]?.product.product_name.toLowerCase();
    if (policyType === "travel") {
        if (productName.includes("viacare")) {
            if (productName.includes("home trip")) {
                secondaryLogoPath = `${__dirname}../../../../../assets/logo/dt-hometrip.png`;
            } else {
                secondaryLogoPath = `${__dirname}../../../../../assets/logo/via_care.png`;
            }
        } else if (productName.includes("selfcare")) {
            secondaryLogoPath = `${__dirname}../../../../../assets/logo/self_care.png`;
        } else if (productName.includes("personal")) {
            secondaryLogoPath = `${__dirname}../../../../../assets/logo/HC-personal.png`;
        } else {
            secondaryLogoPath = `${__dirname}../../../../../assets/logo/travel.png`;
        }
    } else if (policyType === "health") {
        secondaryLogoPath = order.Policy[0]?.takaful_policy
            ? `${__dirname}../../../../../assets/logo/takaful_health_logo.png`
            : `${__dirname}../../../../../assets/logo/personal_health_logo.png`;
    }

    // Add right logo, exactly like left but on other side
    doc.image(secondaryLogoPath, rightLogoX, logoY, { width: logoWidth });

    const textY = logoY + 10;
    doc.fontSize(12)
        .font("Helvetica-Bold")
        .text("SCHEDULE", margin, textY, {
            width: pageWidth - 2 * margin,
            align: "center"
        });

    doc.moveDown(1.5);
}