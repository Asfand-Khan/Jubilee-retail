import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from ".";
import { addScheduleHeader } from "./sections/header";
import { createGeneralApiTable1, drawTable, drawTableRow } from "./pdfUtils";
import { format } from "date-fns/format";
import { formatDate } from "date-fns/format";
import { addVerificationAndQR } from "./sections/verification";
import path from "path";

export type PolicyDetail = FullOrder["Policy"][0]["policyDetails"][0];

export function homeCarePdf(doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder, qrImageUrl: string) {
    console.log("Creating policy home care document");

    const apiUser = policy.apiUser;
    const paymentMethod = order.payemntMethod;
    const productName = policy.product.product_name;

    let isFranchiseOrder: boolean;
    let isFaysalBankOrder: boolean;

    isFaysalBankOrder = (apiUser != null && apiUser.name.includes("faysalbank"));
    isFranchiseOrder = (paymentMethod.name === "Franchise");
    //
    //
    const creatgeneralHomecareTable2 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;

        let tableHeading = "Insured Details";

        if (policy.takaful_policy) {
            tableHeading = "Participant's Details";
        }

        const customerData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "customer");
        // --- Print Table Heading ---
        doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        drawTableRow(doc, currentY, ["Name"], [customerData?.name || ""], [250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Address"], [customerData?.address || ""], [250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["CNIC"], [customerData?.cnic || ""], [250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Phone"], [customerData?.contact_number || ""], [250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Email"], [customerData?.email || ""], [250]);
        currentY += rowHeight;

        currentY -= 5;

        // Draw bottom horizontal line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke();
        // Draw vertical lines now that height is known
        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right
    }

    const creatgeneralHomecareTable3 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const decimalFormat = "#,###";
        let premiumText = "Premium";
        let sumInsuredText = "Insured";
        let periodOfCoverageText = "Insurance";
        let sumValue = Math.round(+policy.sum_insured).toString();
        let tableHeading = "Home Details";

        if (policy.takaful_policy) {
            premiumText = "Contribution";
            sumInsuredText = "Covered";
            periodOfCoverageText = "Coverage";
        }
        if (isFranchiseOrder) {
            sumValue = "150,000";
        }

        const homeCareData = policy.PolicyHomecare[0];
        const plan = policy.plan;
        // --- Print Table Heading ---
        doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        const buildingValue = homeCareData.building;
        const rentValue = homeCareData.rent;
        const homeContentValue = homeCareData.content;
        const jewelryValue = homeCareData.jewelry;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        if (!isFranchiseOrder) {
            drawTableRow(doc, currentY, ["Ownership Status", "Structure Type"], [homeCareData?.ownership_status || "", homeCareData?.structure_type || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Covered Area", "Period of Insurance"], ["Sq yd " + homeCareData.plot_area || "", `From: ${format(new Date(policy.issue_date), "MMM dd, yyyy")}\nTo: ${format(new Date(policy.expiry_date), "MMM dd, yyyy")}` || ""], [250, 250]);
            currentY += rowHeight;
            currentY += 10;
        }

        if (
            (buildingValue != null && buildingValue != "0.0" && Number(buildingValue) > 0) ||
            (rentValue != null && rentValue != "0.0" && Number(rentValue) > 0) ||
            (homeContentValue != null && homeContentValue != "0.0" && Number(homeContentValue) > 0) ||
            (jewelryValue != null && jewelryValue != "0.0" && Number(jewelryValue) > 0)
        ) {
            drawTableRow(doc, currentY, ["Coverage", "Limit (Rs.)", "Premium (Rs.)"], ["", "", ""], [166, 166, 166]);
            currentY += rowHeight;
        }
        if (buildingValue != null && buildingValue != "0.0" && Number(buildingValue) > 0) {
            drawTableRow(doc, currentY, ["Building / Structure", new Intl.NumberFormat().format(+policy.sum_insured), new Intl.NumberFormat().format(+buildingValue)], ["", "", ""], [166, 166, 166]);
            currentY += rowHeight;
        }

        if (rentValue != null && rentValue != "0.0" && Number(rentValue) > 0) {
            drawTableRow(doc, currentY, ["Loss of Rent", new Intl.NumberFormat().format(+policy.sum_insured), new Intl.NumberFormat().format(+rentValue)], ["", "", ""], [166, 166, 166]);
            currentY += rowHeight;
        }

        if (homeContentValue != null && homeContentValue != "0.0" && Number(homeContentValue) > 0) {
            drawTableRow(doc, currentY, ["Home Contents", new Intl.NumberFormat().format(+policy.sum_insured), new Intl.NumberFormat().format(+homeContentValue)], ["", "", ""], [166, 166, 166]);
            currentY += rowHeight;
        }

        if (jewelryValue != null && jewelryValue != "0.0" && Number(jewelryValue) > 0) {
            drawTableRow(doc, currentY, ["Cash & Jewelry", new Intl.NumberFormat().format(+policy.sum_insured), new Intl.NumberFormat().format(+jewelryValue)], ["", "", ""], [166, 166, 166]);
            currentY += rowHeight;
        }
        currentY -= 5;

        // Draw bottom horizontal line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke();
        // Draw vertical lines now that height is known
        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right
    }

    const addFooter = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
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

        doc.moveTo(margin, yStart).lineTo(doc.page.width - margin, yStart).stroke(); // Horizontal line

        doc.fontSize(6.5).text("For Claims, Complaints or "
            + "Queries: " + retailBranch + " Retail Business Division, Jubilee General Insurance"
            + " Company Limited " + Windowtakful + ", 2nd floor, I. I. Chundrigar Road, Karachi, Pakistan."
            + numbers + " " + email + " Our Toll Free Number : 0800 03786", margin, yStart + 2).moveDown();
    }
    //
    //
    // Header Start
    const jubileeImage = path.join(process.cwd(), "uploads", "logo", policy && policy.takaful_policy ? "takaful_logo.png" : "insurance_logo.png");
    let productLogo = path.join(process.cwd(), "uploads", "logo", "home.png");

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

    let policyTypeText = "insurance";
    let windowText = "- ";

    if (policy.takaful_policy) {
        policyTypeText = "takaful";
        windowText = "Window Takaful Operations";
    }

    let paragraph = "All Terms, Conditions and Exclusions as per standard Jubilee General " + productName + " wordings and Clauses\n" +
        "The agreement to purchase this " + policyTypeText + " coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings & " +
        "clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all " +
        "information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company " +
        "Limited " + windowText;
    doc.fontSize(6).font("Helvetica").text(paragraph, 15, doc.y + 5);

    addVerificationAndQR(doc, policy, order, qrImageUrl, isFranchiseOrder);

    // creatgeneralHomecareTable3(doc, policy, order);
    // doc.moveDown();
    addFooter(doc, policy, order);
}