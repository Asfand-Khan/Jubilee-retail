import PDFDocument from "pdfkit";

export function addScheduleHeader(
  doc: InstanceType<typeof PDFDocument>,
  jubileeImage: string | Buffer | undefined,
  productLogo: string
) {
  const pageWidth = doc.page.width;
  const margin = 20;
  let logoWidth = 70;
  // const logoHeight = 40;
  const logoY = margin;
  const leftLogoX = margin;
  const rightLogoX = pageWidth - margin - logoWidth;

  // Main Jubilee logo
  if (jubileeImage) {
    doc.image(jubileeImage, leftLogoX, logoY, {
      width: logoWidth,
    });
  }

  // Product Logo
  if (productLogo) {
    doc.image(productLogo, rightLogoX, logoY, {
      width: logoWidth,
    });
  }

  const textY = logoY + 10;
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("SCHEDULE", margin, textY, {
      width: pageWidth - 2 * margin,
      align: "center",
    });

  doc.moveDown(1.5);
}
