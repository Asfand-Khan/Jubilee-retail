import PDFDocument from "pdfkit";
import { Response } from "express";

import { FullOrder, FullPolicy } from ".";
import { addScheduleHeader } from "./sections/header";
import { createGeneralApiTable1, drawTable, drawTableRow, drawTableRowWithBorders } from "./pdfUtils";
import { format } from "date-fns/format";
import { table } from "console";

export type PolicyDetail = FullOrder["Policy"][0]["policyDetails"][0];

export function getCustomerDetail(policy: FullPolicy, type: string): PolicyDetail | undefined {
    // Assuming policy.policyDetails is an array of objects like PolicyDetail
    // The Java code uses .getCustomer("Customer"), .getCustomer("Spouse"), etc.
    // The equivalent here seems to be a lookup in policyDetails or in PolicyTravel/PolicyHomecare etc.

    // For simplicity, we'll stick to the core data used in the provided creatHealthcareTable2
    // which seems to only use a 'customer' type for the main details.

    const lowerType = type.toLowerCase();

    // For 'Customer'
    if (lowerType === 'customer' || lowerType === 'proposer') {
        return policy.policyDetails.find(d => d.type.toLowerCase() === 'customer');
    }

    // For Spouse/Kid/Beneficiary (Need to map from policyDetails or assumed structure)
    // The exact structure for Spouse/Kid is not 100% clear from the Prisma type, but the Java code implies 
    // a helper function is used. We will simulate that for the parts where details are fetched for others.

    // For now, only basic customer detail retrieval is directly possible:
    if (lowerType === 'spouse') {
        // Find if a spouse detail exists, maybe a separate entry with type 'spouse'
        return policy.policyDetails.find(d => d.type.toLowerCase() === 'spouse');
    }

    // For children, the Java logic iterates through Kid1 to Kid8. This is highly application-specific.
    // For now, return undefined for non-customer/proposer unless explicitly handled.
    return policy.policyDetails.find(d => d.type.toLowerCase() === lowerType);
}

export function healthCarePdf(doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) {
    console.log("Creating policy health care document");

    let isFranchiseOrder = false;
    let isFaysalBankOrder = false;
    let isSCBOrder = false;
    let isHMBOrder = false;
    let isHBLMFBOrder = false;
    let isEasyInsuranceOrder = false;
    let isSmartChoiceOrder = false;
    let isMawazanaOrder = false;
    let isLetsCompareOrder = false;
    let isMMBLOrder = false;

    const spouseData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "spouse")
    const kid1Data = policy.policyDetails.find(detail => detail.type.toLowerCase() === "kid1")

    isFaysalBankOrder = (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("faysalbank"));
    isFranchiseOrder = (order.payemntMethod.name.toLowerCase() === "franchise");
    isSCBOrder = (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("scb"));
    isHMBOrder = (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("hmb"));
    isHBLMFBOrder = (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("hbl microfinance bank"));
    isMMBLOrder = (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("mmbl"));

    if (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("easyinsurance")) {
        isEasyInsuranceOrder = true;
    } else if (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("smartchoice")) {
        isSmartChoiceOrder = true;
    } else if (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("mawazna")) {
        isMawazanaOrder = true;
    } else if (policy.apiUser != null && policy.apiUser.name.toLowerCase().includes("lets compare")) {
        isLetsCompareOrder = true;
    }

    // Health PDF Specific Sections Start
    // const creatHealthcareTable2 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
    //     let x = 20;
    //     const productName = policy.product.product_name.toLowerCase();
    //     const customerData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "customer");
    //     const apiUser = policy.apiUser;
    //     let contribution = "Premium";
    //     let policyType = "Policy";
    //     let DATE_FORMAT = "MMM dd, yyyy HH:mm:ss";
    //     let NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
    //         minimumFractionDigits: 0,
    //         maximumFractionDigits: 2 // Allow up to 2 decimal places if present
    //     })
    //     let inPatientAmount = "";
    //     let outPatientAmount = "";

    //     let tableHeading = "";

    //     if (apiUser != null && (apiUser.name.includes("faysalbank") || apiUser.name.includes("scb"))) {
    //         DATE_FORMAT = "MMM dd, yyyy";
    //     }

    //     if (policy.takaful_policy) {
    //         tableHeading = "Participant's Details";
    //         policyType = "Document";
    //     } else {
    //         tableHeading = "Personal Details";
    //     }

    //     if (isHMBOrder) {
    //         tableHeading = "Insured Details";
    //     }

    //     if (productName.includes("parents-care-plus")) {
    //         tableHeading = "Policy Holder's Details";
    //     } else if (productName.includes("parent")) {
    //         tableHeading = "Proposer's Details";
    //     }

    //     if (
    //         policy.takaful_policy
    //     ) {
    //         contribution = "Contribution";
    //     }

    //     if (policy.plan.name.toLowerCase().includes("silver")) {
    //         inPatientAmount = "PKR 90,000/-";
    //         outPatientAmount = "PKR 10,000/-";
    //     } else if (policy.plan.name.toLowerCase().includes("gold")) {
    //         inPatientAmount = "PKR 230,000/-";
    //         outPatientAmount = "PKR 20,000/-";
    //     } else if (policy.plan.name.toLowerCase().includes("platinum")) {
    //         inPatientAmount = "PKR 460,000/-";
    //         outPatientAmount = "PKR 40,000/-";
    //     }

    //     doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

    //     doc = doc.fontSize(8);
    //     const yStart = doc.y;

    //     doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    //     doc.moveTo(15, yStart - 5).lineTo(15, yStart + 85).stroke(); // vertical line

    //     drawTableRow(doc, yStart, ["Name", "CNIC"], [customerData?.name || "", customerData?.cnic || ""], [250, 250]);
    //     drawTableRow(doc, yStart + 15, ["Address"], [customerData?.address || ""], [250]);
    //     drawTableRow(doc, yStart + 30, ["Phone", "Plan"], [customerData?.contact_number || "", policy.plan.name || ""], [250, 250]);
    //     drawTableRow(doc, yStart + 45, ["Email", contribution], [customerData?.email || "", `PKR ${NUMBER_FORMAT.format(+order.payment)}/-`], [250, 250]);
    //     DATE_FORMAT = "MMMM dd, yyyy";
    //     drawTableRow(doc, yStart + 60, ["Date of Birth", `${policyType} Expiry Date`], [format(new Date(customerData?.dob || Date.now()), DATE_FORMAT), `From: ${format(new Date(policy.start_date), DATE_FORMAT)}`], [250, 250]);
    //     drawTableRow(doc, yStart + 75, ["Age", ""], [customerData?.age?.toString() || "", `To: ${format(new Date(policy.expiry_date), DATE_FORMAT)}`], [250, 250]);

    //     if(productName.includes("parents-care-plus")){
    //         drawTableRow(doc, yStart + 90, ["In Patient Price", "Out Patient Price"], [`PKR ${NUMBER_FORMAT.format(+inPatientAmount)}/-`, `PKR ${NUMBER_FORMAT.format(+outPatientAmount)}/-`], [250, 250]);
    //         doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 100).stroke();
    //         doc.moveTo(15, yStart + 85).lineTo(doc.page.width - 15, yStart + 85).stroke();
    //     }else{
    //         doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 85).stroke(); // vertical line
    //         doc.moveTo(15, yStart + 85).lineTo(doc.page.width - 15, yStart + 85).stroke(); // Horizontal line
    //     }


    //     doc.moveDown(1.5);
    // }
    const creatHealthcareTable2 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder, isHMBOrder: boolean) => {

        const x = 20;
        const productName = policy.product.product_name.toLowerCase();
        const customerData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "customer");
        const beneficiaryData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "beneficiary");
        const apiUser = policy.apiUser;

        let contribution = "Premium";
        let policyType = "Policy";
        let DATE_FORMAT = "MMM dd, yyyy HH:mm:ss";

        // NOTE: The Java logic uses policy.getTotalPrice(), which is assumed to be order.payment 
        // in the existing TS code. We rely on the existing variables for amount calculation.
        let NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })

        let inPatientAmount = "";
        let outPatientAmount = "";

        let tableHeading = "";

        // --- 1. Determine Heading and Formatting ---
        if (apiUser != null && (apiUser.name.includes("faysalbank") || apiUser.name.includes("scb"))) {
            DATE_FORMAT = "MMM dd, yyyy";
        }

        if (policy.takaful_policy) {
            tableHeading = "Participant's Details";
            policyType = "Document";
            contribution = "Contribution"; // Java logic uses conditional for contribution name change
        } else {
            tableHeading = "Personal Details";
        }

        if (isHMBOrder) {
            tableHeading = "Insured Details";
        }

        if (productName.includes("parents-care-plus") || productName.includes("parent")) {
            tableHeading = "Proposer's Details";
        }


        // Parents-Care-Plus Specific In/Out Patient Amounts
        if (productName.includes("parents-care-plus")) {
            if (policy.plan.name.toLowerCase().includes("silver")) {
                inPatientAmount = "PKR 90,000/-";
                outPatientAmount = "PKR 10,000/-";
            } else if (policy.plan.name.toLowerCase().includes("gold")) {
                inPatientAmount = "PKR 230,000/-";
                outPatientAmount = "PKR 20,000/-";
            } else if (policy.plan.name.toLowerCase().includes("platinum")) {
                inPatientAmount = "PKR 460,000/-";
                outPatientAmount = "PKR 40,000/-";
            }
        }

        // --- 2. Print Table Heading ---
        doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // --- 3. Draw Initial Border for main content area ---

        // Determine the base height needed before conditionals (8 rows of content for most cases)
        let baseHeight = 85;
        if (productName.includes("parents-care-plus")) {
            baseHeight = 100; // Extra row for In/Out Patient Price
        }

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line
        doc.moveTo(padding, yStart - 5).lineTo(padding, yStart + baseHeight).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, yStart + baseHeight).stroke(); // Right Vertical line


        // --- 4. Draw Main Customer Details (8 rows for non-Parents-Care-Plus) ---

        // Row 1: Name, CNIC (Java c1/c2, c5/c6)
        drawTableRow(doc, currentY, ["Name", "CNIC"], [customerData?.name || "", customerData?.cnic || ""], [250, 250]);
        currentY += rowHeight;

        // Row 2: Address (Java c3/c4) - Note: Java uses the other two cells for padding/empty
        drawTableRow(doc, currentY, ["Address", ""], [customerData?.address || "", ""], [250, 250]);
        currentY += rowHeight;

        // Row 3: Phone, Plan (Java c7/c8, c11/c12)
        // Only show Plan if non-Parents-Care-Plus (as per Java conditional logic placement)
        const showPlan = !productName.includes("parents-care-plus");
        const label3b = showPlan ? "Plan" : "";
        const value3b = showPlan ? policy.plan.name || "" : "";

        drawTableRow(doc, currentY, ["Phone", label3b], [customerData?.contact_number || "", value3b], [250, 250]);
        currentY += rowHeight;

        // Row 4: Email, Contribution/Premium (Java c9/c10, c13/c14)
        drawTableRow(doc, currentY, ["Email", contribution], [customerData?.email || "", `PKR ${NUMBER_FORMAT.format(+order.payment)}/-`], [250, 250]);
        currentY += rowHeight;

        // Row 5: Tax Status (Java c15/c16) - skipped for HBL/Parents-Care-Plus
        // const showTax = !productName.includes("hbl") && !productName.includes("parents-care-plus");
        // if (showTax) {
        //     drawTableRow(doc, currentY, ["Tax Status", ""], [policy.filer_tax_status ? "Filer" : "Non Filer", ""], [250, 250]); // assuming filer_tax_status is on customerData
        //     currentY += rowHeight;
        // }

        // Row 6 (or adjusted row): Date of Birth, Policy Expiry Date (Java c31/c32, c23/c24)
        DATE_FORMAT = "MMMM dd, yyyy"; // New format after Contribution row, as per TS logic
        drawTableRow(doc, currentY, ["Date of Birth", `${policyType} Expiry Date`], [format(new Date(customerData?.dob || Date.now()), DATE_FORMAT), `From: ${format(new Date(policy.start_date), DATE_FORMAT)}`], [250, 250]);
        currentY += rowHeight;

        // Row 7 (or adjusted row): Age, Expiry To Date (Java c33/c34)
        const showAge = !productName.includes("parents-care-plus");
        const label7a = showAge ? "Age" : "";
        const value7a = showAge ? customerData?.age?.toString() || "" : "";

        drawTableRow(doc, currentY, [label7a, ""], [value7a, `To: ${format(new Date(policy.expiry_date), DATE_FORMAT)}`], [250, 250]);
        currentY += rowHeight;


        // --- 5. Parents-Care-Plus Specific Rows ---
        if (productName.includes("parents-care-plus")) {
            // The last horizontal line for the base area needs to be drawn *before* this content in the original TS code.
            // I will rely on the TS version's placement, which draws the bottom line later.

            // Row 8: In Patient Price, Out Patient Price (Java c35-c38)
            drawTableRow(doc, currentY, ["In Patient Price", "Out Patient Price"], [`${inPatientAmount}`, `${outPatientAmount}`], [250, 250]);
            currentY += rowHeight;
        }

        // --- 6. Draw Final Border Lines for Base Table ---

        // The original TS logic already had this, so let's ensure the cursor position is correct.
        const finalY = productName.includes("parents-care-plus") ? yStart + 100 : yStart + 85;

        doc.moveTo(padding, finalY).lineTo(doc.page.width - padding, finalY).stroke(); // Bottom Horizontal line


        // --- 7. Conditional Non-Filer Tax Rows (Below main box) ---
        // Java logic: if ("Non-Filer".equals(policy.getFilerTaxStatus()) && !policy.getProduct().getName().contains("Parents-Care-Plus"))

        // if (policy.filer_tax_status === false && !productName.includes("parents-care-plus")) {
        //     currentY = doc.y;

        //     // ADI Tax 4% (Java c17/c18) - assuming tax data fields are available on policy object
        //     const taxAmount = policy.filer_tax_per_item || 0; // assuming this field is on policy
        //     const totalAmount = policy.filer_tax_total || order.payment; // assuming this field is on policy

        //     drawTableRow(doc, currentY, ["ADI Tax 4% on premium", ""], [`PKR ${NUMBER_FORMAT.format(+taxAmount)}/-`, ""], [250, 250]);
        //     currentY += rowHeight;

        //     // Two empty cells/line separators (Java empty cells)
        //     currentY += rowHeight;

        //     // Net Premium including ADI Tax (Java c19/c20)
        //     drawTableRow(doc, currentY, ["Net Premium including ADI Tax", ""], [`PKR ${NUMBER_FORMAT.format(+totalAmount)}/-`, ""], [250, 250]);
        //     currentY += rowHeight;
        // }


        // --- 8. Conditional Beneficiary Details (Below main box) ---
        // Java logic: if (!policy.getProduct().getName().contains("Parents-Care-Plus") && policy.getProduct().getName().contains("Parent") && policy.getCustomer("Beneficiary") != null)

        if (!productName.includes("parents-care-plus") && productName.includes("parent") && beneficiaryData?.name) {

            doc.moveDown(0.5); // Space after previous block
            currentY = doc.y;

            // Draw horizontal line before Beneficiary details
            doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke();
            currentY += 5; // move down after line draw

            // Beneficiary Name/Contact (Java c25/c26, c27/c28)
            drawTableRow(doc, currentY, ["Beneficiary Name", "Beneficiary Contact"], [beneficiaryData.name, beneficiaryData.contact_number || ""], [250, 250]);
            currentY += rowHeight;

            // Relationship with Beneficiary (Java c29/c30)
            drawTableRow(doc, currentY, ["Relationship with Beneficiary", ""], [beneficiaryData.relation || "", ""], [250, 250]);
            currentY += rowHeight;

            // Draw horizontal line after Beneficiary details
            doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke();
        }
    }

    const creatHealthcareTable3 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
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

        drawTableRow(doc, currentY, ["Name", "CNIC", "Age"], [spouseData?.name || "", spouseData?.cnic || "", spouseData?.age?.toString() || ""], [200, 166.6, 166.6]);
        currentY += rowHeight;
        // drawTableRow(doc, currentY, ["Age", ""], [spouseData?.age?.toString() || "", ""], [250, 250]);
        // currentY += rowHeight;

        if (spouse1Data != null && spouse1Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "CNIC", "Age"], [spouse1Data?.name || "", spouse1Data?.cnic || "", spouse1Data?.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
            // drawTableRow(doc, currentY, ["Age", ""], [spouse1Data?.age?.toString() || "", ""], [250, 250]);
            // currentY += rowHeight;
        }

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
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

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        if (kid1Data != null && kid1Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid1Data.name || "", kid1Data.relation || "", kid1Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid2Data != null && kid2Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid2Data.name || "", kid2Data.relation || "", kid2Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid3Data != null && kid3Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid3Data.name || "", kid3Data.relation || "", kid3Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid4Data != null && kid4Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid4Data.name || "", kid4Data.relation || "", kid4Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid5Data != null && kid5Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid5Data.name || "", kid5Data.relation || "", kid5Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid6Data != null && kid6Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid6Data.name || "", kid6Data.relation || "", kid6Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid7Data != null && kid7Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid7Data.name || "", kid7Data.relation || "", kid7Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }
        if (kid8Data != null && kid8Data != undefined) {
            drawTableRow(doc, currentY, ["Name", "Relation", "Age"], [kid8Data.name || "", kid8Data.relation || "", kid8Data.age?.toString() || ""], [200, 166.6, 166.6]);
            currentY += rowHeight;
        }

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
    }

    const createParentCareTable = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        let motherName = "Mother's Name";
        let motherCNIC = "Mother's CNIC";
        let motherAge = "Mother's Age";
        let fatherName = "Father's Name";
        let fatherCNIC = "Father's CNIC";
        let fatherAge = "Father's Age";
        let tableHeading = "Parents Details";

        const motherData = policy.policyDetails.find(detail => detail.type.toLowerCase() == "mother");
        const fatherData = policy.policyDetails.find(detail => detail.type.toLowerCase() == "father");
        const motherInLawData = policy.policyDetails.find(detail => detail.type.toLowerCase() == "mother-inlaw");
        const fatherInLawData = policy.policyDetails.find(detail => detail.type.toLowerCase() == "father-inlaw");
        const bothInLawData = policy.policyDetails.find(detail => detail.type.toLowerCase() == "both-inlaw");

        if (motherData != undefined || motherInLawData != undefined) {
            tableHeading = "Mother Details";
            motherName = "Name";
            motherCNIC = "CNIC";
            motherAge = "Age";
        } else if (fatherData != undefined || fatherInLawData != undefined) {
            tableHeading = "Father Details";
            fatherName = "Name";
            fatherCNIC = "CNIC";
            fatherAge = "Age";
        } else if (motherInLawData != undefined) {
            tableHeading = "Mother-in-Law Details";
        } else if (fatherInLawData != undefined) {
            tableHeading = "Father-in-Law Details";
        } else if (bothInLawData != undefined) {
            tableHeading = "Parents-in-Law Details";
            motherName = "Mother-in-Law's Name";
            motherCNIC = "Mother-in-Law's CNIC";
            motherAge = "Mother-in-Law's Age";
            fatherName = "Father-in-Law's Name";
            fatherCNIC = "Father-in-Law's CNIC";
            fatherAge = "Father-in-Law's Age";
        }

        doc.fontSize(10).font("Helvetica-Bold").text(tableHeading, x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        if (motherData != null && motherData != undefined) {
            drawTableRow(doc, currentY, [motherName, motherCNIC], [motherData.name || "", motherData.cnic || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, [motherAge, "Phone"], [motherData.age?.toString() || "", motherData.contact_number || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Address"], [motherData.address || ""], [250]);
            currentY += rowHeight;
        }
        if (fatherData != null && fatherData != undefined) {
            drawTableRow(doc, currentY, [fatherName, fatherCNIC], [fatherData.name || "", fatherData.cnic || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, [fatherAge, "Phone"], [fatherData.age?.toString() || "", fatherData.contact_number || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Address"], [fatherData.address || ""], [250]);
            currentY += rowHeight;
        }
        if (motherInLawData != null && motherInLawData != undefined) {
            drawTableRow(doc, currentY, [motherName, motherCNIC], [motherInLawData.name || "", motherInLawData.cnic || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, [motherAge, "Phone"], [motherInLawData.age?.toString() || "", motherInLawData.contact_number || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Address"], [motherInLawData.address || ""], [250]);
            currentY += rowHeight;
        }
        if (fatherInLawData != null && fatherInLawData != undefined) {
            drawTableRow(doc, currentY, [fatherName, fatherCNIC], [fatherInLawData.name || "", fatherInLawData.cnic || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, [fatherAge, "Phone"], [fatherInLawData.age?.toString() || "", fatherInLawData.contact_number || ""], [250, 250]);
            currentY += rowHeight;
            drawTableRow(doc, currentY, ["Address"], [fatherInLawData.address || ""], [250]);
            currentY += rowHeight;
        }

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke();
    }

    const creatHealthCareRiderTable = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;
        const riders = policy.FblPolicyRider.length > 0 ? policy.FblPolicyRider : [];

        doc.fontSize(10).font("Helvetica-Bold").text("Rider's Details", x).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;

        // Draw the vertical lines based on calculated height
        doc.moveTo(padding, yStart - 5).lineTo(doc.page.width - padding, yStart - 5).stroke(); // Top Horizontal line

        riders.forEach(rider => {
            drawTableRow(doc, currentY, ["Covered Name", "Sum Assured"], [rider.rider_name || "", rider.sum_insured || ""], [250, 250]);
            currentY += rowHeight;
        })

        doc.moveTo(padding, yStart - 5).lineTo(padding, currentY).stroke(); // Left Vertical line
        doc.moveTo(doc.page.width - padding, yStart - 5).lineTo(doc.page.width - padding, currentY).stroke(); // Right Vertical line
        doc.moveTo(padding, currentY).lineTo(doc.page.width - padding, currentY).stroke(); // Bottom Horizontal line
    }

    const creatHealthcareTable4 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
        const x = 20;

        doc.fontSize(10).font("Helvetica-Bold").text("Benefit Plans", x, doc.y).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;


        // if (isFaysalBankOrder && productName.includes("female centric health takaful")) {
            const plan = policy.plan.name.toLowerCase();
            let hospitalizationLimitValue = "";
            let herCareValue = "";
            let maternityCoverValue = "";
            if (plan.includes("plan a")) {
                hospitalizationLimitValue = "PKR 400,000 - SEMI PVT";
                herCareValue = "PKR 500,000";
                maternityCoverValue = "150,000 - Standard\n" +
                    "| 250,000 Operation";
            } else if (plan.includes("plan b")) {
                hospitalizationLimitValue = "PKR 600,000 - PVT";
                herCareValue = "PKR 1,000,000";
                maternityCoverValue = "250,000 - Standard\n" +
                    "| 350,000 Operation";
            }

            let hospitalizationLimitCoverage = hospitalizationLimitValue;

            drawTable(doc, [
                [
                    "Health Comprehensive cover",
                    "Annual Hospitalization Limit (Per Annum/Per Person)",
                    hospitalizationLimitCoverage
                ],
                [
                    "Pre-&Post Hospitalization",
                    "30 Days Covering Consultation, Medicines and lab tests preceding admission to the hospital and after discharge from hospital",
                    "Covered"
                ],
                [
                    "Day Care Procedures & Specialized Investigation",
                    "Dialysis, Cataract Surgery, MRI, CT Scan, Endoscopy, Thallium Scan, Angiography, and Treatment of Fracture etc.",
                    "Covered"
                ],
                [
                    "Emergency Expenses",
                    "Accidental Outpatient Expense, Local Ambulance Expenses, Accidental Dental Expense",
                    "Covered (within 48 hours of the incident)"
                ],
                [
                    "Pre-Existing condition Limits",
                    "1st year: 0%,\n2nd year: 30%,\n3rd Year: 60%,\n4th Year: 80%",
                    "Covered (within 48 hours of the incident)"
                ],
                [
                    "Her Care (NO Pre-Existing condition )",
                    "8 Critical Female related illnesses\nBreast Cancer\nCervical Cancer\nBurns\nParalysis or multi-trauma\nFallopian Tube Cancer\nUterine or Endometrial Cancer\nVaginal Cancer\nOvarian Cancer\nCongenital Disease of a new born (50% payout of total)",
                    herCareValue
                ],
                [
                    "Maternity Cover",
                    "This will be available for all the customers",
                    maternityCoverValue
                ],
                [
                    "Tele Health",
                    "Sehat Kahani",
                    "Covered"
                ],
            ], {
                x: 20,
                y: currentY,
                columnWidths: [180, 200, 180],
                headers: ["Benefits", "Description", "Coverage"],
            });


        // }

    }


    // 
    // 
    // 
    // 
    // 
    // Header Start
    const jubileeImage = policy && policy.takaful_policy ? `${__dirname}../../../../assets/logo/takaful_logo.png` : `${__dirname}../../../../assets/logo/insurance_logo.png`;
    let productLogo = `${__dirname}../../../../assets/logo/family.png`;

    const productName = policy.product.product_name.toLowerCase();

    if (policy.productOption.webappMappers.some(mapper => mapper.child_sku.toLowerCase().includes("personal"))) {
        productLogo = `${__dirname}../../../../assets/logo/personal.png`;
    } else if (productName.includes("lifestyle")) {
        productLogo = `${__dirname}../../../../assets/logo/lifestyle.png`;
    } else if (productName.includes("parent")) {
        productLogo = `${__dirname}../../../../assets/logo/parent.png`;
    } else if (productName.includes("hercare")) {
        productLogo = `${__dirname}../../../../assets/logo/HC-HerCare.png`;
    } else if (isFaysalBankOrder) {
        if (productName.includes("family")) {
            productLogo = jubileeImage;
        } else if (productName.includes("personal accident")) {
            productLogo = jubileeImage;
        } else if (productName.includes("female centric health takaful")) {
            productLogo = jubileeImage;
        } else {
            productLogo = jubileeImage;
        }
    } else if (productName.includes("mib") && productName.includes("family")) {
        productLogo = jubileeImage;
    } else if (productName.includes("mib") && productName.includes("personal")) {
        productLogo = jubileeImage;
    } else if (isHBLMFBOrder) {
        productLogo = jubileeImage;
    } else if (productName.includes("hbl")) {
        productLogo = jubileeImage;
    } else if (productName.includes("shifa-daily")) {
        productLogo = jubileeImage;
    } else if (isSCBOrder) {
        productLogo = jubileeImage;
    } else if (isHMBOrder) {
        productLogo = jubileeImage;
    } else if (isMMBLOrder) {
        productLogo = jubileeImage;
    } else {
        productLogo = `${__dirname}../../../../assets/logo/family.png`;
    }

    // Append Header
    addScheduleHeader(doc, jubileeImage, productLogo);
    // Header End

    // Policy Details Table Start
    createGeneralApiTable1(doc, policy, order);
    doc.moveDown();
    // Policy Details Table End

    if (productName.includes("fbl-personal accident")) {
        creatHealthcareTable2(doc, policy, order, isHMBOrder);
        doc.moveDown();
        // PdfPTable benefitDetailsTable = createBenefitTable(document, ffont, f1, policy);
    } else if (!productName.includes("lifestyle")) {
        creatHealthcareTable2(doc, policy, order, isHMBOrder);
        doc.moveDown();

        if (productName.includes("family")) {
            if (spouseData != null && spouseData != undefined) {
                creatHealthcareTable3(doc, policy, order);
                doc.moveDown();
            }
            if (kid1Data != null && kid1Data != undefined) {
                doc.moveDown(1);
                creatHealthcareChildDetail(doc, policy, order);
                doc.moveDown();
            }
        }

        if (productName.includes("parent") && !productName.includes("parents-care-plus")) {
            createParentCareTable(doc, policy, order);
            doc.moveDown();
        }
        if (isFaysalBankOrder && policy.FblPolicyRider.length > 0) {
            creatHealthCareRiderTable(doc, policy, order);
            doc.moveDown();
        }

        doc.moveDown(0.5);
        creatHealthcareTable4(doc, policy, order);

        if (productName.includes("family") || (productName.includes("parent") && !productName.includes("parents-care-plus"))) {
            // creatHealthcarePolicyBenefits(document, ffont, f1, policy);
        } else if (!productName.includes("parents-care-plus")) {
            // creatHealthcareTable5(document, ffont, f1, policy);
        }
    }

}