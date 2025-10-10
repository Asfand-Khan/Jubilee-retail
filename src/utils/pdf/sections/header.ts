import PDFDocument from "pdfkit";

export function addScheduleHeader(doc: InstanceType<typeof PDFDocument>, jubileeImage: string, productLogo: string) {
    const pageWidth = doc.page.width;
    const margin = 20;
    let logoWidth = 70;
    // const logoHeight = 40;
    const logoY = margin;
    const leftLogoX = margin;
    const rightLogoX = pageWidth - margin - logoWidth;

    // Main Jubilee logo
    doc.image(jubileeImage, leftLogoX, logoY, {
        width: logoWidth,
        // height: logoHeight
    });

    // Product Logo
    doc.image(productLogo, rightLogoX, logoY, {
        width: logoWidth,
        // height: logoHeight 
    });

    const textY = logoY + 10;
    doc.fontSize(12)
        .font("Helvetica-Bold")
        .text("SCHEDULE", margin, textY, {
            width: pageWidth - 2 * margin,
            align: "center"
        });

    doc.moveDown(1.5);
}