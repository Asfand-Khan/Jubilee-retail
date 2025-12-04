import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from ".";
import { addScheduleHeader } from "./sections/header";
import { createGeneralApiTable1, drawTableRow } from "./pdfUtils";
import { addVerificationAndQR } from "./sections/verification";
import path from "path";

export type PolicyDetail = FullOrder["Policy"][0]["policyDetails"][0];

export function purchaseProtectionPdf(
  doc: InstanceType<typeof PDFDocument>,
  policy: FullPolicy,
  order: FullOrder,
  qrImageUrl: string
) {
  console.log("Creating policy purchase protection document");

  const paymentMethod = order.payemntMethod;
  const productName = policy.product.product_name;

  let isFranchiseOrder: boolean;

  isFranchiseOrder = paymentMethod.name === "Franchise";

  const creatPurchaseProtectionTable2 = (
    doc: InstanceType<typeof PDFDocument>,
    policy: FullPolicy,
    order: FullOrder
  ) => {
    const x = 20;

    let tableHeading = "Insured Details";

    if (policy.takaful_policy) {
      tableHeading = "Participant's Details";
    }

    const customerData = policy.policyDetails.find(
      (detail) => detail.type.toLowerCase() === "customer"
    );

    doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5); // Print Table Heading

    doc = doc.fontSize(8);
    const yStart = doc.y;
    const padding = 15;
    const rowHeight = 15;
    let currentY = yStart;

    doc
      .moveTo(padding, yStart - 5)
      .lineTo(doc.page.width - padding, yStart - 5)
      .stroke(); // Top Horizontal line

    drawTableRow(
      doc,
      currentY,
      ["Name", "Email"],
      [customerData?.name || "", customerData?.email || ""],
      [250, 250]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      ["Address"],
      [customerData?.address || ""],
      [250]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      ["CNIC", "Phone"],
      [customerData?.cnic || "", customerData?.contact_number || ""],
      [250, 250]
    );
    currentY += rowHeight;

    currentY -= 5;

    // Draw bottom horizontal line
    doc
      .moveTo(padding, currentY)
      .lineTo(doc.page.width - padding, currentY)
      .stroke(); // Draw bottom horizontal line
    // Draw vertical lines now that height is known
    doc
      .moveTo(padding, yStart - 5)
      .lineTo(padding, currentY)
      .stroke(); // Left
    doc
      .moveTo(doc.page.width - padding, yStart - 5)
      .lineTo(doc.page.width - padding, currentY)
      .stroke(); // Right
  };

  const creatPurchaseProtectionTable3 = (
    doc: InstanceType<typeof PDFDocument>,
    policy: FullPolicy,
    order: FullOrder
  ) => {
    const x = 20;
    let tableHeading = "Insured Details";

    if (policy.takaful_policy) {
      tableHeading = "Covered Details";
    }

    const protectionData = policy.PolicyPurchaseProtection[0];

    doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5); // Print Table Heading

    doc = doc.fontSize(8);
    const yStart = doc.y;
    const padding = 15;
    const rowHeight = 15;
    let currentY = yStart;

    doc
      .moveTo(padding, yStart - 5)
      .lineTo(doc.page.width - padding, yStart - 5)
      .stroke(); // Top Horizontal line

    drawTableRow(
      doc,
      currentY,
      ["Name", "Serial Number"],
      [protectionData.name, protectionData.serial_number || "N/A"],
      [250, 250]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      ["IMEI", "Sum Insured"],
      [protectionData.imei || "N/A", protectionData.sum_insured || "N/A"],
      [250, 250]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      ["Total Price", "Item Price"],
      [protectionData.total_price || "N/A", protectionData.item_price || "N/A"],
      [250, 250]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      ["Recived Premium", "Duration"],
      [
        protectionData.received_premium || "N/A",
        `${protectionData.duration} (${protectionData.duration_type})` || "N/A",
      ],
      [250, 250]
    );
    currentY += rowHeight;

    currentY -= 5;

    doc
      .moveTo(padding, currentY)
      .lineTo(doc.page.width - padding, currentY)
      .stroke(); // Draw bottom horizontal line
    // Draw vertical lines now that height is known
    doc
      .moveTo(padding, yStart - 5)
      .lineTo(padding, currentY)
      .stroke(); // Left
    doc
      .moveTo(doc.page.width - padding, yStart - 5)
      .lineTo(doc.page.width - padding, currentY)
      .stroke(); // Right
  };

  const addFooter = (
    doc: InstanceType<typeof PDFDocument>,
    policy: FullPolicy,
    order: FullOrder
  ) => {
    const margin = doc.options.margin ? +doc.options.margin : 20;
    const pageHeight = doc.page.height;
    const footerHeight = 20; // Approximate height based on content
    let yStart = doc.y;

    let retailBranch = ""; //
    let Windowtakful = ""; //
    let email = "buyonline@jubileegeneral.com.pk"; //
    let numbers = "(021) 32462225, (021) 111 654 111, "; //
    if (policy.takaful_policy) {
      retailBranch = "Takaful";
      Windowtakful = " Window Takaful Operations.";
      email = "takaful-online@jubileegeneral.com.pk";
    }

    // Check if footer fits on current page
    if (yStart + footerHeight > pageHeight - margin) {
      doc.addPage();
      yStart = margin; // Reset yStart for new page
    }

    // Set footer to start after content, ending at page height - margin
    yStart = pageHeight - margin - footerHeight;
    doc.y = yStart;

    doc
      .moveTo(margin, yStart)
      .lineTo(doc.page.width - margin, yStart)
      .stroke(); // Horizontal line

    doc
      .fontSize(6.5)
      .text(
        "For Claims, Complaints or " +
          "Queries: " +
          retailBranch +
          " Retail Business Division, Jubilee General Insurance" +
          " Company Limited " +
          Windowtakful +
          ", 2nd floor, I. I. Chundrigar Road, Karachi, Pakistan." +
          numbers +
          " " +
          email +
          " Our Toll Free Number : 0800 03786",
        margin,
        yStart + 2
      )
      .moveDown();
  };

  const jubileeImage = path.join(
    process.cwd(),
    "uploads",
    "logo",
    policy && policy.takaful_policy ? "takaful_logo.png" : "insurance_logo.png"
  );
  let productLogo = path.join(process.cwd(), "uploads", "logo", "purchase_protection.png");

  addScheduleHeader(doc, jubileeImage, productLogo, true);
  
  createGeneralApiTable1(doc, policy, order);
  doc.moveDown();

  creatPurchaseProtectionTable2(doc, policy, order);
  doc.moveDown();

  creatPurchaseProtectionTable3(doc, policy, order);
  doc.moveDown();

  let policyTypeText = "insurance";
  let windowText = "- ";

  if (policy.takaful_policy) {
    policyTypeText = "takaful";
    windowText = "Window Takaful Operations";
  }

  let paragraph = `All Terms, Conditions and Exclusions as per standard Jubilee General ${productName} wordings and Clauses.\nThe agreement to purchase this ${policyTypeText} coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings & clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company Limited ${windowText}`;
  
  doc.fontSize(6).font("Helvetica").text(paragraph, 15, doc.y + 5);

  addVerificationAndQR(doc, policy, order, qrImageUrl, isFranchiseOrder);

  addFooter(doc, policy, order);
}
