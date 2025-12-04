
import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from ".";
import { addScheduleHeader } from "./sections/header";
import { createGeneralApiTable1, drawTable, drawTableRow } from "./pdfUtils";
import { format } from "date-fns/format";
import { formatDate } from "date-fns/format";
import { addVerificationAndQR } from "./sections/verification";
import path from "path";

export type PolicyDetail = FullOrder["Policy"][0]["policyDetails"][0];

export function selfCarePdf(
  doc: InstanceType<typeof PDFDocument>,
  policy: FullPolicy,
  order: FullOrder,
  qrImageUrl: string
) {
  console.log("Creating policy self care document");

  const apiUser = policy.apiUser;
  const paymentMethod = order.payemntMethod;
  const productName = policy.product.product_name;

  let isFranchiseOrder: boolean;
  let isFaysalBankOrder: boolean;

  isFaysalBankOrder = apiUser != null && apiUser.name.includes("faysalbank");
  isFranchiseOrder = paymentMethod.name === "Franchise";
  //
  //
  const creatgeneralHomecareTable2 = (
    doc: InstanceType<typeof PDFDocument>,
    policy: FullPolicy,
    order: FullOrder
  ) => {
    const x = 20;

    let tableHeading = "Personal Details";
    if (policy.takaful_policy) {
      tableHeading = "Participant's Details";
    }

    const customerData = policy.policyDetails.find(
      (detail) => detail.type.toLowerCase() === "customer"
    );
    const beneficiaryData = policy.policyDetails.find(
      (detail) => detail.type.toLowerCase() === "beneficiary"
    );
    // --- Print Table Heading ---
    doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

    doc = doc.fontSize(8);
    const yStart = doc.y;
    const padding = 15;
    const rowHeight = 15;
    let currentY = yStart;

    // Draw the vertical lines based on calculated height
    doc
      .moveTo(padding, yStart - 5)
      .lineTo(doc.page.width - padding, yStart - 5)
      .stroke(); // Top Horizontal line

    drawTableRow(
      doc,
      currentY,
      ["Name", "CNIC"],
      [
        customerData?.name || "",
        (customerData?.cnic || "").replace(/^(\d{5})(\d{7})(\d{1})$/, "$1-$2-$3"),
      ],
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

    if (beneficiaryData != null) {
      drawTableRow(
        doc,
        currentY,
        ["Phone"],
        [(customerData?.contact_number || "").replace(/^(\d{4})(\d{7})$/, "$1-$2")],
        [250]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Email", "Name Beneficiary"],
        [customerData?.email || "", beneficiaryData.name || ""],
        [250, 250]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Date of Birth", "Relationship with Beneficiary"],
        [
          format(new Date(customerData?.dob || new Date()), "MMM dd, yyyy") || "",
          beneficiaryData?.relation
            ? beneficiaryData.relation.charAt(0).toUpperCase() + beneficiaryData.relation.slice(1)
            : "",
        ],
        [250, 250]
      );

      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Age", "Beneficiary's Contact No."],
        [
          customerData?.age?.toString() || "",
          (beneficiaryData?.contact_number || "").replace(/^(\d{4})(\d{7})$/, "$1-$2"),
        ],
        [250, 250]
      );
      currentY += rowHeight;
    } else {
      drawTableRow(
        doc,
        currentY,
        ["Phone", "Email"],
        [customerData?.contact_number || "", customerData?.email || ""],
        [250, 250]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Age", "Date of Birth"],
        [
          customerData?.age?.toString() || "",
          format(new Date(customerData?.dob || new Date()), "MMM dd, yyyy") ||
          "",
        ],
        [250, 250]
      );
      currentY += rowHeight;
    }

    currentY -= 5;

    // Draw bottom horizontal line
    doc
      .moveTo(padding, currentY)
      .lineTo(doc.page.width - padding, currentY)
      .stroke();
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

  const creatgeneralHomecareTable3 = (
    doc: InstanceType<typeof PDFDocument>,
    policy: FullPolicy,
    order: FullOrder
  ) => {
    const x = 20;
    let netPremium, sumInsured, periodOfInsurance, sumValue, peronslaAccidentBenefits, lossOfIdentificationValue, medical, burialRepatriation, peronslaAccidentBenefitsValue, medicalValue, burialRepatriationValue;
    netPremium = "Net Premium";
    sumInsured = "Sum Insured";
    sumValue = Math.round(+policy.sum_insured);
    periodOfInsurance = "Period Of Insurance";

    if (policy.takaful_policy) {
      netPremium = "Net Contribution";
      sumInsured = "Sum Covered";
      periodOfInsurance = "Period Of Coverage";
    }
    if (isFranchiseOrder) {
      sumValue = "PKR 150,000/-";
    }

    const plan = policy.plan;
    if (policy.product?.product_name.toLowerCase().includes("accident")) {
      if (plan.name) {
        peronslaAccidentBenefits = "Personal Accident Benefits";
        medical = "Medical";
        burialRepatriation = "Burial & Repatriation";
        if (plan.name.toLowerCase().includes("a")) {
          peronslaAccidentBenefitsValue = "PKR 100,000/-";
          medicalValue = "PKR 25,000/-";
          burialRepatriationValue = "PKR 20,000/-";
          lossOfIdentificationValue = "PKR 5,000/-";
        }
        if (plan.name.toLowerCase().includes("b")) {
          peronslaAccidentBenefitsValue = "PKR 250,000/-";
          medicalValue = "-";
          burialRepatriationValue = "-";
          lossOfIdentificationValue = "-";
        }
        if (plan.name.toLowerCase().includes("c")) {
          peronslaAccidentBenefitsValue = "PKR 150,000/-";
          medicalValue = "";
          burialRepatriationValue = "";
          lossOfIdentificationValue = "-";
        }
        if (plan.name.toLowerCase().includes("d")) {
          peronslaAccidentBenefitsValue = "PKR 50,000/-";
          medicalValue = "";
          burialRepatriationValue = "";
          lossOfIdentificationValue = "-";
        }
      }
    } else {
      if (plan.name) {
        peronslaAccidentBenefits = "Personal Accident Benefits";
        medical = "Medical";
        burialRepatriation = "Burial & Repatriation";
        if (plan.name.toLowerCase().includes("a")) {
          peronslaAccidentBenefitsValue = "PKR 200,000/-";
          medicalValue = "PKR 20,000/-";
          burialRepatriationValue = "PKR 20,000/-";
        }
        if (plan.name.toLowerCase().includes("b")) {
          peronslaAccidentBenefitsValue = "PKR 350,000/-";
          medicalValue = "PKR 35,000/-";
          burialRepatriationValue = "PKR 35,000/-";
        }
        if (plan.name.toLowerCase().includes("c")) {
          peronslaAccidentBenefitsValue = "PKR 500,000/-";
          medicalValue = "PKR 50,000/-";
          burialRepatriationValue = "PKR 50,000/-";
        }
      }
    }
    // --- Print Table Heading ---
    // doc.fontSize(10).font("Helvetica-Bold").text("", x)
    doc.moveDown(2);

    doc = doc.fontSize(8);
    const yStart = doc.y;
    const padding = 15;
    const rowHeight = 15;
    let currentY = yStart;

    // Draw the vertical lines based on calculated height
    doc
      .moveTo(padding, yStart - 5)
      .lineTo(doc.page.width - padding, yStart - 5)
      .stroke(); // Top Horizontal line

    drawTableRow(
      doc,
      currentY,
      ["Plan Selected", "Coverage"],
      [
        plan.name || "",
        "Limits ",
      ],
      [250, 250],
      [true, true],
      [false, true],
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      [netPremium, peronslaAccidentBenefits || "Personal Accident Benefits"],
      [
        `PKR ${new Intl.NumberFormat().format(+policy.item_price)}/-` || "",
        peronslaAccidentBenefitsValue || "-",
      ],
      [250, 250],
      [true, false]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      [sumInsured, medical || "Medical"],
      [
        `PKR ${new Intl.NumberFormat().format(+sumValue)}/-` || "",
        medicalValue || "-",
      ],
      [250, 250],
      [true, false]
    );
    currentY += rowHeight;
    drawTableRow(
      doc,
      currentY,
      [periodOfInsurance, burialRepatriation || "Burial & Repatriation"],
      [
        `From: ${format(
          new Date(policy.issue_date),
          "MMM dd, yyyy"
        )}\nTo: ${format(new Date(policy.expiry_date), "MMM dd, yyyy")}` || "",
        burialRepatriationValue || "-",
      ],
      [250, 250],
      [true, false]
    );
    if (policy.product?.product_name.toLowerCase().includes("accident")) {
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        [ '', "Loss of Identification Papers\n& Documents"],
        [
         "",
          lossOfIdentificationValue || "-",
        ],
        [250, 250],
        [true, false]
      );
    }
    // end of standard rows
    currentY += rowHeight;
    currentY += 4;
    if (isFranchiseOrder) {
      drawTableRow(
        doc,
        currentY,
        ["Coverage", "Limit", ""],
        ["", ""],
        [166.6, 166.6, 166.6]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["", "100,000", ""],
        ["", ""],
        [166.6, 166.6, 166.6]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Accidental Medical Expense", "25,000", ""],
        ["", ""],
        [166.6, 166.6, 166.6]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Burial & Repatriation", "20,000", ""],
        ["", ""],
        [166.6, 166.6, 166.6]
      );
      currentY += rowHeight;
      drawTableRow(
        doc,
        currentY,
        ["Loss of Identification Papers & Documents", "5,000", ""],
        ["", ""],
        [166.6, 166.6, 166.6]
      );
      currentY += rowHeight;
    }

    // Draw bottom horizontal line
    doc
      .moveTo(padding, currentY)
      .lineTo(doc.page.width - padding, currentY)
      .stroke();
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

    let retailBranch = "";
    let Windowtakful = "";
    let email = "buyonline@jubileegeneral.com.pk";
    let numbers = "(021) 32462225, (021) 111 654 111, ";
    if (policy.takaful_policy) {
      retailBranch = "Takaful";
      Windowtakful = " Window Takaful Operations.";
      email = "takaful-online@jubileegeneral.com.pk";
    }

    if (isFranchiseOrder) {
      email = "cs@jubileegeneral.com.pk";
      numbers = "";
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
  //
  //
  // Header Start
  const jubileeImage = path.join(process.cwd(), "uploads", "logo", policy && policy.takaful_policy ? "takaful_logo.png" : "insurance_logo.png");
  let productLogo = productName.toLowerCase().includes("self") ? path.join(process.cwd(), "uploads", "logo", "self.png") : path.join(process.cwd(), "uploads", "logo", "personal-accident.png");

  // Append Header
  addScheduleHeader(doc, jubileeImage, productLogo);
  // Header End

  // Policy Details Table Start
  createGeneralApiTable1(doc, policy, order);
  doc.moveDown();
  // Policy Details Table End

  creatgeneralHomecareTable2(doc, policy, order);
  doc.moveDown();

  creatgeneralHomecareTable3(doc, policy, order);
  doc.moveDown();

  let windowTakaful = "";
  let policyWording = "Policy wordings";
  let participant = "policy wordings";
  let purchase = "purchase this insurance coverage";

  if (policy.takaful_policy) {
    policyWording = "Takaful wordings";
    purchase = "choose this takaful coverage";
    participant = "Participant's Membership Document wording";
    windowTakaful = " - Window Takaful Operations.";
  }

  let paragraph =
    "All Terms, Conditions and Exclusions as per standard Jubilee General SelfCare " +
    policyWording +
    " and Clauses\n" +
    "The agreement to " +
    purchase +
    " is a declaration that I/we have read & understood the terms & conditions stated in the " +
    participant +
    " & " +
    "clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all " +
    "information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company " +
    "Limited" +
    windowTakaful;
  doc
    .fontSize(6)
    .font("Helvetica")
    .text(paragraph, 15, doc.y + 5);

  addVerificationAndQR(doc, policy, order, qrImageUrl, isFranchiseOrder);

  // creatgeneralHomecareTable3(doc, policy, order);
  // doc.moveDown();
  addFooter(doc, policy, order);
}
