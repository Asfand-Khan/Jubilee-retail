import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from ".";
import { addScheduleHeader } from "./sections/header";
import { createGeneralApiTable1, drawTable, drawTableRow } from "./pdfUtils";
import { format } from "date-fns/format";

export type PolicyDetail = FullOrder["Policy"][0]["policyDetails"][0];

export function viaCarePdf(doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder, qrImageUrl: string) {
    console.log("Creating policy via care document");

    const apiUser = policy.apiUser;
    const paymentMethod = order.payemntMethod;
    const productName = policy.product.product_name;

    let isFranchiseOrder = false;
    let isFaysalBankOrder = false;

    isFaysalBankOrder = (apiUser != null && apiUser.name.includes("faysalbank"));
    isFranchiseOrder = (paymentMethod.name === "Franchise");

    const spouseData = policy.policyDetails.find(detail => detail.type === "Spouse")
    const kid1Data = policy.policyDetails.find(detail => detail.type === "Kid1")
    const kid2Data = policy.policyDetails.find(detail => detail.type === "Kid2")
    const kid3Data = policy.policyDetails.find(detail => detail.type === "Kid3")
    const kid4Data = policy.policyDetails.find(detail => detail.type === "Kid4")
    //
    //
    // Travel Specific Sections Start

    const creatViacareTable2 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;

        let tableHeading = "Insured Details";
        let DATE_FORMAT = "MMM dd, yyyy";
        // let NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
        //     minimumFractionDigits: 0,
        //     maximumFractionDigits: 2
        // })

        if (policy.takaful_policy) {
            tableHeading = "Participant's Details";
        }

        const customerData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "customer");
        const beneficiaryData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "beneficiary");

        // --- Print Table Heading ---
        doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        drawTableRow(doc, currentY, ["Name", "CNIC"], [customerData?.name || "", customerData?.cnic || ""], [250, 250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Address"], [customerData?.address || ""], [250]);
        currentY += rowHeight;

        const hasPassport = customerData?.passport_no && customerData.passport_no.length > 0;
        if (hasPassport) {
            drawTableRow(doc, currentY, ["Phone", "Passport No"], [customerData?.contact_number || "", customerData?.passport_no || ""], [250, 250]);
        } else {
            drawTableRow(doc, currentY, ["Phone"], [customerData?.contact_number || ""], [500]);
        }
        currentY += rowHeight;

        const dobDate = new Date(customerData?.dob || Date.now());
        const dobStr = format(dobDate, DATE_FORMAT);

        // Assume age is available or calculate it
        let age = customerData?.age;
        if (!age && customerData?.dob) {
            const today = new Date();
            age = today.getFullYear() - dobDate.getFullYear();
            if (today.getMonth() < dobDate.getMonth() || (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate())) {
                age--;
            }
        }

        const email = customerData?.email || "";

        if (beneficiaryData) {
            const benefName = beneficiaryData?.name || "";
            const benefRelation = beneficiaryData?.relation || "";
            const benefContact = beneficiaryData?.contact_number || "";
            const benefCnic = beneficiaryData?.cnic || "";

            drawTableRow(doc, currentY, ["Email", "Name Beneficiary"], [email, benefName], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Date of Birth", "Relationship with Beneficiary"], [dobStr, benefRelation], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Age", "Beneficiary's Contact No"], [age?.toString() || "", benefContact], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["", "Beneficiary's CNIC"], ["", benefCnic], [250, 250]);
            currentY += rowHeight;
        } else {
            drawTableRow(doc, currentY, ["Email", "Date of Birth"], [email, dobStr], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Age"], [age?.toString() || ""], [250]);
            currentY += rowHeight;
        }
        currentY -= 5;

        // Draw bottom horizontal line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke();
        // Draw vertical lines now that height is known
        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right
    }

    const creatViacareTable3 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const spouseData = policy.policyDetails.find(detail => detail.type.toLowerCase() == "spouse");
        const spouse1Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "spouse1")

        doc.fontSize(10).font("Helvetica-Bold").text("Spouse Details", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        drawTableRow(doc, currentY, ["Name", "CNIC"], [spouseData?.name || "", spouseData?.cnic || ""], [250, 250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Age", "Passport No"], [spouseData?.age?.toString() || "", spouseData?.passport_no || "---"], [250, 250]);
        currentY += rowHeight;

        if (spouse1Data != null && spouse1Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "CNIC"], [spouse1Data?.name || "", spouse1Data?.cnic || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Age", "Passport No"], [spouse1Data?.age?.toString() || "", spouse1Data.passport_no || "---"], [250, 250]);
            currentY += rowHeight;
        }

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
    }

    const creatViacareTable4 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const travelData = policy.PolicyTravel[0];
        const plan = policy.plan;

        // Define conditions
        const isBookme = apiUser?.name.includes("bookme") || false;
        const isTakaful = policy.takaful_policy || false;

        doc.fontSize(10).font("Helvetica-Bold").text("Travel Details", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        // Prepare conditional labels and values
        let condLabel = "";
        let condValue = "";
        let purposeLabel = "";
        let purposeValue = "";
        let stay = "Maximum Stay";
        if (isFranchiseOrder) {
            stay = "Stay";
            condLabel = "Plan";
            condValue = plan.name || "";
            purposeLabel = "";
            purposeValue = "";
        } else if (isBookme) {
            condLabel = "Visit";
            condValue = travelData.travel_purpose || "";
            purposeLabel = "";
            purposeValue = "";
        } else {
            condLabel = "Tenure";
            let noOfDays = travelData.no_of_days || "";
            if (!noOfDays.includes("months") && !noOfDays.includes("days")) {
                noOfDays += " Days";
            }
            condValue = noOfDays;
            purposeLabel = "Purpose of travel";
            purposeValue = travelData.travel_purpose || "";
        }

        // Date formatting
        const fromDate = format(new Date(travelData.travel_start_date || Date.now()), "MMM dd, yyyy");
        const toDate = format(new Date(travelData.travel_end_date || Date.now()), "MMM dd, yyyy");

        // Stay value
        let stayValue = travelData.no_of_days || "";
        if (stayValue.includes("months")) {
            stayValue = "Upto " + stayValue;
        } else {
            stayValue = "Upto " + stayValue + " Days";
        }

        // Premium logic (simplified, no filer/non-filer)
        const premium = isTakaful ? "Contribution" : "Premium";
        const netPremium = order.payment;
        const netPremiumStr = "PKR " + netPremium + "/-";

        // Build rows as {ll, lv, rl, rv}
        const rows = [];

        // Row 1
        rows.push({ ll: "Destination", lv: travelData.destination || "", rl: condLabel, rv: condValue });

        // Row 2
        rows.push({ ll: "From Date", lv: fromDate, rl: stay, rv: stayValue });

        // Row 3
        rows.push({ ll: "To Date", lv: toDate, rl: "Net " + premium, rv: netPremiumStr });

        // Row 4 (no tax status, so skip or empty if needed, but here we proceed without)
        if (isBookme) {
            rows.push({ ll: "", lv: "", rl: "", rv: "" });
        }

        // Last row: Travel From and optional right pair
        let lastRl = purposeLabel;
        let lastRv = purposeValue;
        if (isFranchiseOrder) {
            lastRl = "Travel By";
            lastRv = travelData.travel_type || "";
        }
        rows.push({ ll: "Travel From", lv: travelData.travel_from || "", rl: lastRl, rv: lastRv });

        // Draw rows
        rows.forEach(row => {
            drawTableRow(doc, currentY, [row.ll, row.rl], [row.lv, row.rv], [250, 250]);
            currentY += rowHeight;
        });

        // Draw vertical and bottom lines
        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left vertical
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right vertical
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom horizontal
    }

    const creatHealthcareChildDetail = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const kid1Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid1");
        const kid2Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid2");
        const kid3Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid3");
        const kid4Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid4");
        const kid5Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid5");
        const kid6Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid6");
        const kid7Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid7");
        const kid8Data = policy.policyDetails.find(detail => detail.type.toLowerCase() == "kid8");

        doc.fontSize(10).font("Helvetica-Bold").text("Children's Details", x).moveDown(0.5);

        doc = doc.fontSize(6.5);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        if (kid1Data != null && kid1Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid1Data.name || "", kid1Data.relation || "", kid1Data.age?.toString() || "", kid1Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid2Data != null && kid2Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid2Data.name || "", kid2Data.relation || "", kid2Data.age?.toString() || "", kid2Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid3Data != null && kid3Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid3Data.name || "", kid3Data.relation || "", kid3Data.age?.toString() || "", kid3Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid4Data != null && kid4Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid4Data.name || "", kid4Data.relation || "", kid4Data.age?.toString() || "", kid4Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid5Data != null && kid5Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid5Data.name || "", kid5Data.relation || "", kid5Data.age?.toString() || "", kid5Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid6Data != null && kid6Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid6Data.name || "", kid6Data.relation || "", kid6Data.age?.toString() || "", kid6Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid7Data != null && kid7Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid7Data.name || "", kid7Data.relation || "", kid7Data.age?.toString() || "", kid7Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }
        if (kid8Data != null && kid8Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age", "Passport No"], [kid8Data.name || "", kid8Data.relation || "", kid8Data.age?.toString() || "", kid8Data.passport_no || ""], [150, 120, 120, 130]);
            currentY += rowHeight;
        }

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
    }

    const createNewFranchiseCoverageDetails = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;

        doc.fontSize(10).font("Helvetica-Bold").text("Coverage Detail", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y - 5;

        drawTable(doc, [
            ["Coverage Description", "By Air", "By Bus/Train"],
            ["Accidental Death and Permanent Total Disability", "1,000,000", "500,000"],
            ["Accidental Medical Reimbursement", "50,000", "50,000"],
            ["Emergency Medical Evacuation", "By Air", "By Bus/Train"],
            ["Repatriation of Mortal Remains", "15,000", "15,000"],
            ["Loss of Baggage", "7,500", "2,500"],
            ["Loss of C.N.I.C", "2,000", "1,000"]
        ], {
            x: 15,
            y: yStart,
            columnWidths: [314, 125, 125],
            headers: [],
        });

    }

    const creatViacareTable5 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const parts = productName.toUpperCase().split("\\–");
        const prod_name = parts[0];

        doc.fontSize(10).font("Helvetica-Bold").text("BENEFIT PLANS", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y - 5;
        let currentY = yStart;

        drawTable(doc, [], {
            x: 15,
            y: currentY,
            columnWidths: [565],
            headers: [prod_name],
        });
        currentY = doc.y + 1.2;

        drawTable(doc, [], {
            x: 15,
            y: currentY,
            columnWidths: [565],
            headers: ["Product Benefit Table"],
        });
        currentY = doc.y + 1.2;

        drawTable(doc, [
            ["Plan (Limits in PKR only)"]
        ], {
            x: 15,
            y: currentY,
            columnWidths: [565],
            headers: [],
        });
        currentY = doc.y + 1.5;

        let ad_and_pd = "";
        let ami = "";
        let eme = "";
        let romr = "";
        let lob = "";
        let loc = "";
        if (productName.toLowerCase().includes("viacare travel insurance – domestic plan")) {
            // if (policy.getPlan().getName().contains("Platinum")) {
            //     ad_and_pd = "1,000,000";
            // } else if (policy.getPlan().getName().contains("Diamond")) {
            //     ad_and_pd = "750,000";
            // } else if (policy.getPlan().getName().contains("Gold")) {
            ad_and_pd = "500,000";
            ami = "25,000";
            eme = "15,000";
            romr = "15,000";
            lob = "3,000";
            loc = "1,500";
            // }
        }
        let accidentalDeathCoverageLimit = "";
        drawTable(doc, [
            ["Accidental Death & Permanent Disability", ad_and_pd],
            ["Accidental medical reimbursement", ami],
            ["Emergency medical evacuation", eme],
            ["Repatriation of Mortal Remains *", romr],
            ["Loss of baggage", lob],
            ["Loss of CNIC", loc]
        ], {
            x: 15,
            y: currentY,
            columnWidths: [400, 165],
            headers: [],
        });
        currentY = doc.y + 11;

        drawTable(doc, [
            ["* In case of Natural Death only"]
        ], {
            x: 15,
            y: currentY,
            columnWidths: [565],
            headers: [],
        });

    }

    const createStudentProgramDetails = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const travelData = policy.PolicyTravel[0];

        doc.fontSize(10).font("Helvetica-Bold").text("Program Details", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        drawTableRow(doc, currentY, ["Institute", "Program Name"], [travelData.institute || "", travelData.program || ""], [250, 250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Program Duration", "Offer Letter"], [travelData.program_duration || "", travelData.offer_letter_ref_no || ""], [250, 250]);
        currentY += rowHeight;

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
    }

    const createStudentSponsersDetails = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const travelData = policy.PolicyTravel[0];

        doc.fontSize(10).font("Helvetica-Bold").text("Sponsor Details", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        drawTableRow(doc, currentY, ["Sponsor", "Sponsor's Contact No"], [travelData.sponsor || "", travelData.sponsor_contact || ""], [250, 250]);
        currentY += rowHeight;
        drawTableRow(doc, currentY, ["Sponsor Address"], [travelData.sponsor_address || "",], [250]);
        currentY += rowHeight;

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
    }

    const createZiaratCoverageDetails = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const plan = policy.plan;

        doc.fontSize(10).font("Helvetica-Bold").text("Coverage Detail", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y - 5;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;


        drawTable(doc, [
            ["Product Plan", plan.name],
            ["Accidental Death and Permanent Total Disability", "PKR 300,000"],
            ["Accidental Death and Permanent Total Disability due to act of Terrorism", "PKR 300,000"],
            ["Hospitalization", "PKR 75,000"],
            ["Burial & Repatriation", "50,000"],
            ["Loss of Checked in Baggage", "20,000"],
            ["Loss of Cash", "10,000"]
        ], {
            x: 15,
            y: currentY,
            columnWidths: [400, 165],
            headers: [],
        });
        currentY = doc.y + 1.2;
    }

    const addVerificationAndQR = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder, qrImageUrl: string, isFranchiseOrder: boolean) => {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height; // 841.89 for A4
        const margin = 20;
        const columnWidth = (pageWidth) / 2;
        let yStart = doc.y;

        let policyWord = "Policy";
        let websiteLink = "https://jubileegeneral.com.pk/getinsurance/policy-verification";
        let retailBranch = "";
        let takafulWindowText = "Digitally signed for & on behalf of\nJUBILEE GENERAL INSURANCE COMPANY LIMITED";
        if (policy.takaful_policy) {
            policyWord = "PMD";
            websiteLink = "https://jubileegeneral.com.pk/gettakaful/policy-verification";
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

    const addFooter = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const margin = doc.options.margin ? +doc.options.margin : 20;
        const pageHeight = doc.page.height;
        const footerHeight = 140; // Approximate height based on content
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

        if (policy.apiUser?.name.includes("bookmee")) { } else {
            // Column 1: Claims and Contact Information
            doc.fontSize(7).font("Helvetica-Bold").text("For assistance World-wide, contact", margin, yStart + 25, { width: (doc.page.width) / 2, align: "left" });
            doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +44 (0)2920 474131", margin, yStart + 33, { width: (doc.page.width) / 2, align: "left" });
            doc.text(`Cardiff, UK    Email: operations@global-response.co.uk\nCC to: Travel@jubileegeneral.com.pk`, margin, yStart + 42, { width: (doc.page.width) / 2, align: "left" });

            doc.fontSize(7).font("Helvetica-Bold").text("For assistance in Africa, contact", margin, yStart + 67, { width: (doc.page.width) / 2, align: "left" });
            doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +27 10 100 3045", margin, yStart + 77, { width: (doc.page.width) / 2, align: "left" });
            doc.text(`Johannesburg, Email: operations@global-response.co.uk\nSouth Africa`, margin, yStart + 86, { width: (doc.page.width) / 2, align: "left" });

            doc.fontSize(7).font("Helvetica-Bold").text("For assistance in Europe, contact", margin, yStart + 108, { width: (doc.page.width) / 2, align: "left" });
            doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +34 919 04 47 15", margin, yStart + 117, { width: (doc.page.width) / 2, align: "left" });
            doc.text(`Madrid, Spain Email: operations@global-response.co.uk`, margin, yStart + 126, { width: (doc.page.width) / 2, align: "left" });

            // Column 2: Exclusions
            doc.fontSize(7).font("Helvetica-Bold").text("For assistance in the Americas, contact", margin + (doc.page.width) / 2 + 20, yStart + 25, { width: (doc.page.width) / 2, align: "left" });
            doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +1 317 927 6895", margin + (doc.page.width) / 2 + 20, yStart + 33, { width: (doc.page.width) / 2, align: "left" });
            doc.text(`Indianapolis, USA Email: operations@global-response.co.uk`, margin + (doc.page.width) / 2 + 20, yStart + 42, { width: (doc.page.width) / 2, align: "left" });

            doc.fontSize(7).font("Helvetica-Bold").text("For assistance in Asia Pacific, contact", margin + (doc.page.width) / 2 + 20, yStart + 63, { width: (doc.page.width) / 2, align: "left" });
            doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +852 3008 8234", margin + (doc.page.width) / 2 + 20, yStart + 74, { width: (doc.page.width) / 2, align: "left" });
            doc.text(`Hong Kong Email: operations@global-response.co.uk`, margin + (doc.page.width) / 2 + 20, yStart + 83, { width: (doc.page.width) / 2, align: "left" });
        }

    }

    // Travel Specific Sections End
    //
    //
    // Header Start
    const jubileeImage = policy && policy.takaful_policy ? `${process.env.BASE_URL}/uploads/logo/takaful_logo.png` : `${process.env.BASE_URL}/uploads/logo/insurance_logo.png`;
    let productLogo = `${__dirname}../../../../assets/logo/travel.png`;

    // Append Header
    addScheduleHeader(doc, jubileeImage, productLogo);
    // Header End

    // Policy Details Table Start
    createGeneralApiTable1(doc, policy, order);
    doc.moveDown();
    // Policy Details Table End

    creatViacareTable2(doc, policy, order);
    doc.moveDown();

    if (spouseData != null && spouseData != undefined) {
        creatViacareTable3(doc, policy, order);
        doc.moveDown();
    }

    if (kid1Data != null || kid2Data != null
        || kid3Data != null || kid4Data != null) {
        doc.moveDown(0.5);
        creatHealthcareChildDetail(doc, policy, order);
        doc.moveDown();
    }

    doc.moveDown();
    creatViacareTable4(doc, policy, order);

    if (isFranchiseOrder) {
        doc.moveDown(1.5);
        createNewFranchiseCoverageDetails(doc, policy, order);
    }
    if (apiUser?.name.includes("bookme")) {
        doc.moveDown(1.5);
        creatViacareTable5(doc, policy, order);
    }
    if (productName.includes("Student")) {
        doc.moveDown(1.5);
        createStudentProgramDetails(doc, policy, order);
        doc.moveDown(2.5);
        createStudentSponsersDetails(doc, policy, order);
    }
    if (productName.includes("Ziarat")) {
        doc.moveDown(1.5);
        createZiaratCoverageDetails(doc, policy, order);
    }

    let paragraph = "Your Insurance does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat.All Terms, Conditions and Exclusions as per standard Jubilee General ViaCare Policy wordings and Clauses\n" +
        "The agreement to purchase this insurance coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings & " +
        "clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all " +
        "information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company " +
        "Limited";
    if (policy.takaful_policy) {
        paragraph = "Your Takaful does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat.All Terms, Conditions and Exclusions as per standard Jubilee General ViaCare Takaful wordings and Clauses\n"
            + "The agreement to choose this takaful coverage is a declaration that I/we have read & understood the terms & conditions stated in the Participant's "
            + "Membership Document wordings and I/we hereby agree to the terms & conditions stated therein. I also declare and affirm that I/we am/are in good health and "
            + "fit to travel. I/we have not been advised against traveling by my/our doctor. I hereby declare that all information stated in this schedule is true and complete"
            + "and that I/we have not concealed any material confirmation from Jubilee General Insurance Company Limited - Window Takaful Operations.";
    }
    else if (productName.toLowerCase().includes("viacare schengen travel insurance")) {
        paragraph = "Your Insurance does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat.This Policy covers Hospitalization and Medical Expense for USD 50,000 limit, being higher than the requirement of EU30,000.\n" +
            "All Terms, Conditions and Exclusions as per standard Jubilee General ViaCare Policy wordings and Clauses\n" +
            "The agreement to purchase this insurance coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings & " +
            "clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all " +
            "information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company " +
            "Limited";
    }

    else if (productName.toLowerCase().includes("via care rest of the world travel insurance")) {
        paragraph = "Your Insurance does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat.This Policy covers Hospitalization and Medical Expense for USD 10,000 limit.\n" +
            "All Terms, Conditions and Exclusions as per standard Jubilee General ViaCare Policy wordings and Clauses\n" +
            "The agreement to purchase this insurance coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings & " +
            "clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all " +
            "information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company " +
            "Limited";
    }

    if (policy.schengen) {
        paragraph = "This Policy covers Hospitalization and Medical Expense for USD 50,000 limit, being higher than the requirement of EU30,000.\n" +
            "Your Insurance does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat.\n" +
            "All Terms, Conditions and Exclusions as per standard Jubilee General ViaCare Policy wordings and Clauses\n" +
            "The agreement to purchase this insurance coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings and I/we hereby agree to the terms & " +
            "conditions stated therein. I also declare and affirm that I/we am/are in good health and fit to travel. I/we have not been advised against traveling by my/our doctor. I hereby declare that all information " +
            "stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company Limited";
    }

    if (productName.toLowerCase().includes("student")) {
        paragraph = "Your Insurance does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat.\n" +
            "All Terms, Conditions and Exclusions as per standard Jubilee General ViaCare Policy wordings and Clauses\n" +
            "The agreement to purchase this insurance coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings and I/we hereby agree to the terms & conditions stated therein. I also " +
            "declare and affirm that I/we am/are in good health and fit to travel. I/we have not been advised against traveling by my/our doctor. I hereby declare that all information stated in this schedule is true and complete and that I/we " +
            "have not concealed any material confirmation from Jubilee General Insurance Company Limited.\n" +
            "This policy includes coverage for emergency medical expense and hospitalization for a limit up to USD 50,000. Terms and conditions applicable as per the relevant policy wording document.";
    }

    // drawTableRow(doc, doc.y, [], [paragraph], [250]);
    doc.fontSize(6).font("Helvetica").text(paragraph, 15, doc.y + 13);

    addVerificationAndQR(doc, policy, order, qrImageUrl, isFranchiseOrder);

    addFooter(doc, policy, order);
}