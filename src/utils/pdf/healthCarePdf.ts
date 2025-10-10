import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from ".";
import { addScheduleHeader } from "./sections/header";
import { createGeneralApiTable1, creatHealthcareChildDetail, drawTable, drawTableRow } from "./pdfUtils";
import { format } from "date-fns/format";

export type PolicyDetail = FullOrder["Policy"][0]["policyDetails"][0];

export function healthCarePdf(doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) {
    console.log("Creating policy health care document");

    const apiUser = policy.apiUser;
    const paymentMethod = order.payemntMethod;
    const spouseData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "spouse")
    const kid1Data = policy.policyDetails.find(detail => detail.type.toLowerCase() === "kid1")
    const productName = policy.product.product_name.toLowerCase()

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

    isFaysalBankOrder = (apiUser != null && apiUser.name.toLowerCase().includes("faysalbank"));
    isFranchiseOrder = (paymentMethod.name.toLowerCase() === "franchise");
    isSCBOrder = (apiUser != null && apiUser.name.toLowerCase().includes("scb"));
    isHMBOrder = (apiUser != null && apiUser.name.toLowerCase().includes("hmb"));
    isHBLMFBOrder = (apiUser != null && apiUser.name.toLowerCase().includes("hbl microfinance bank"));
    isMMBLOrder = (apiUser != null && apiUser.name.toLowerCase().includes("mmbl"));

    if (apiUser != null && apiUser.name.toLowerCase().includes("easyinsurance")) {
        isEasyInsuranceOrder = true;
    } else if (apiUser != null && apiUser.name.toLowerCase().includes("smartchoice")) {
        isSmartChoiceOrder = true;
    } else if (apiUser != null && apiUser.name.toLowerCase().includes("mawazna")) {
        isMawazanaOrder = true;
    } else if (apiUser != null && apiUser.name.toLowerCase().includes("lets compare")) {
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
        
        const customerData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "customer");
        const beneficiaryData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "beneficiary");
        let contribution = "Premium";
        let policyType = "Policy";
        let DATE_FORMAT = "MMM dd, yyyy HH:mm:ss";
        let NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
        let inPatientAmount = "";
        let outPatientAmount = "";
        let tableHeading = "";

        if (apiUser != null && (apiUser.name.includes("faysalbank") || apiUser.name.includes("scb"))) {
            DATE_FORMAT = "MMM dd, yyyy";
        }

        if (policy.takaful_policy) {
            tableHeading = "Participant's Details";
            policyType = "Document";
            contribution = "Contribution";
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

        doc.fontSize(10).font("Helvetica-Bold").text("Benefit Plans", x, doc.y + 2).moveDown(0.5);

        doc = doc.fontSize(8);
        const yStart = doc.y - 5;
        const padding = 15;
        const rowHeight = 15;
        let currentY = yStart;


        if (isFaysalBankOrder && productName.includes("female centric health takaful")) {
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
        }
        else if (productName.includes("parents-care-plus")) {

            const planName = policy.plan.name.toLowerCase();
            drawTable(doc, [], {
                x: 15,
                y: currentY,
                columnWidths: [565],
                headers: ["Parents Care Plus"],
            });
            currentY = doc.y + 1.2;
            drawTable(doc, [], {
                x: 15,
                y: currentY,
                columnWidths: [565],
                headers: ["Parents Benefit Table"],
            });

            let coverageLimitValue = "";
            let roomPerDayValue = "";
            let icuChargesValue = "Actual";
            let ambulanceCharges = "PKR 3,000";
            let preHospitalizationValue = "30 days";
            let nursingBenefitsValue = "The product also provides a nursing care benefit of PKR " +
                "20,000 in case of hospitalization due to paralysis, stroke " +
                "or fracture and nursing care is advised by the attending " +
                "physician. The benefit is payable once a year only";
            let dayCareValue = "Covered";
            let preExistingValue = "a. 1st year 10% of Annual Limit\n" +
                "b. 2nd year 20% of Annual Limit\n" +
                "c. 3rd year 30% of Annual Limit\n" +
                "d. 4th year & onward 50% of Annual Limit";
            let msoValue = "Covered";
            let onlineDoctorValue = "Covered";

            if (planName.includes("silver")) {
                coverageLimitValue = "Rs. 90,000";
                roomPerDayValue = "PKR 10,000";
            } else if (planName.includes("gold")) {
                coverageLimitValue = "Rs. 230,000";
                roomPerDayValue = "PKR 25,000";
            } else if (planName.includes("platinum")) {
                coverageLimitValue = "Rs. 460,000";
                roomPerDayValue = "PKR 40,000";
            }

            currentY = doc.y + 1.2;
            drawTable(doc, [
                ["Plan", planName.toUpperCase()],
                ["Limit Per Person (annual) Hospital Expense Benefit – (Total Room Rent, Hospital/Surgical Expenses for a minimum 24 hours)", `${coverageLimitValue}/-`]
            ], {
                x: 15,
                y: currentY,
                columnWidths: [400, 165],
                headers: [],
            });

            currentY = doc.y + 10;
            drawTable(doc, [
                ["Sub Limits"],
            ], {
                x: 15,
                y: currentY,
                columnWidths: [565],
                headers: [],
            });

            currentY = doc.y + 1.2;
            drawTable(doc, [
                ["Room Limit per Day", roomPerDayValue],
                ["ICU / Operation Theatre charges", `${icuChargesValue}`],
                ["Ambulance - per Hospitalization / per policy", `${ambulanceCharges}/-`],
                ["Pre Hospitalization", `${preHospitalizationValue}`],
                ["Post Hospitalization – Nursing Care Benefit: PKR 20,000 / Year", `${nursingBenefitsValue}`],
                ["Day-Care Procedures & Specialized Investigations in outpatient setting including but not limited to:\n" + "Dialysis, Cataract Surgery, MRI, CT Scan, Endoscopy, Thallium Scan, Angiography, and Treatment of Fracture. Emergency dental treatment due to accidental injuries within 48 hours (for pain relief only).", `${dayCareValue}`],
                ["Pre-Existing Conditions & Congenital Anomalies Coverage", `${preExistingValue}`],
                ["International Medical Second Opinion (MSO) Benefit:\n" + " International Medic al Second opinion from MediGuide International from some of the best hospitals across the world.", `${msoValue}`],
                ["Online Doctor Consultation:\n" + "Online Audio / Video consultation through our Partner", `${onlineDoctorValue}`]
            ], {
                x: 15,
                y: currentY,
                columnWidths: [400, 165],
                headers: [],
            });

        }
        else if (isMMBLOrder) {
            let tableHeading = "COMPREHENSIVE HEALTH COVER";
            if (productName.includes("maternity")) {
                tableHeading = "COMPREHENSIVE HEALTH + MATERNITY COVER";
            }

            drawTable(doc, [], {
                x: 15,
                y: currentY,
                columnWidths: [565],
                headers: [tableHeading],
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
                ["Hospitalization Limit", "PKR 400,000"],
                ["Room & Board entitlement (Per day)", "PKR 8,500"],
                ["Age Limit", "Entry Age: 18-60 years\n" + "Renewal up to 65 years \n" + "Children 02-24 Years\n"],
                ["In case of Accidental Hospitalization", "Covered"],
                ["-Pre-Hospitalization Diagnostic Charges (30 days prior to Hospitalization)\n" +
                    "-Post-Hospitalization Follow-up Charges (30 days after discharge)\n" +
                    "-Physician’s Visit (In-Patient visit) Charges\n" +
                    "-Specialist Consultation (In-Patient visit) Charges \n" +
                    "-Intensive Care Unit (ICU) Charges \n" +
                    "-Miscellaneous Hospital Expenses\n" +
                    "-Surgical Operation Charges \n" +
                    "-Day-care Surgery Charges\n" +
                    "-Hospital Casualty Ward Accident & Emergency Services\n", "Covered"],
                ["Pre-existing Condition Covered (Waiting Period)", "45 Days (PEC not covered for some conditions as mentioned below in major conditions & exclusions)"],
                ["Specialized Investigations Outpatient Cover: (Magnetic Resonance Imaging (MRI), Computed Tomography (CT) Scan, Endoscopy. Thallium Scan, Angiography)", "Covered during hospitalization only"],
                ["Treatment of Fractures & Lacerated Wound, Local road ambulance for emergencies only.", "Covered"],
                ["Emergency Dental Treatment due to Accidental Injuries within 48 hours for pain relief only)", "Covered"],
                ["Treatment for Interferon Therapy for Hepatitis B&C", "Covered"],
                ["Ambulance Charges (Per visit)", "3000/="],
                ["Burial Charges", "10,000/-"],
                ["Loss of Income during Hospitalization (Patient should be confined within a hospital for at least 7 Consecutive days & Benefit will be payable for admitted days only of each hospitalization).", "1000/- per day"],
                productName.includes("maternity") ? ["Maternity - Normal/C-Section (Waiting period 60 days)", "PKR 100,000/="] : []
            ], {
                x: 15,
                y: currentY,
                columnWidths: [400, 165],
                headers: [],
            });

        }
        // else {
        //     const productName = policy.product.product_name.toLowerCase();
        //     const planName = policy.plan.name.toLowerCase();
        //     let isParent = false;

        //     let tableHeading = "FAMILY HEALTH CARE";
        //     if (isFaysalBankOrder) {
        //         if (productName.includes("family")) {
        //             tableHeading = "Takaful Family Health Cover";
        //         } else {
        //             tableHeading = "Takaful Health Cover";
        //         }
        //     } else if (isHBLMFBOrder) {
        //         tableHeading = "SelfCare (Accidental Death, Disability & Medical Expense Insurance Cover)";
        //     } else if (productName.includes("personal")) {
        //         tableHeading = "PERSONAL HEALTH CARE";
        //     } else if (productName.includes("hercare")) {
        //         tableHeading = "HER CARE";
        //     } else if (productName.includes("mib") && productName.includes("family")) {
        //         tableHeading = "MIB FAMILY HEALTH PLAN";
        //     } else if (productName.includes("hbl")) {
        //         tableHeading = "HBL Daily Hospital Cash";
        //     } else if (productName.includes("shifa-daily")) {
        //         tableHeading = "SHIFA-Daily Cash Insurance";
        //     } else if (isSCBOrder) {
        //         tableHeading = "HOSPITAL TAKAFUL COVER";
        //     } else if (isHMBOrder) {
        //         tableHeading = "COMPREHENSIVE HEALTH COVER";
        //     } else {
        //         tableHeading = "FAMILY HEALTH CARE";
        //     }

        //     drawTable(doc, [], {
        //         x: 15,
        //         y: currentY,
        //         columnWidths: [565],
        //         headers: [tableHeading],
        //     });

        //     currentY = doc.y + 1.2;

        //     let benefitTableHeading = "Product Benefit Table";
        //     if (productName.includes("parent")) {
        //         isParent = true;
        //         benefitTableHeading = "Product Benefit Table / Per Annum / Per Parent";
        //     }

        //     drawTable(doc, [], {
        //         x: 15,
        //         y: currentY,
        //         columnWidths: [565],
        //         headers: [benefitTableHeading],
        //     });

        //     let hospitalLimit = "550,000";
        //     if (productName.includes("hercare")) {
        //         if (planName.includes("platinum")) {
        //             hospitalLimit = "1,000,000";
        //         } else if (planName.includes("diamond")) {
        //             hospitalLimit = "750,000";
        //         } else if (planName.includes("gold")) {
        //             hospitalLimit = "500,000";
        //         }
        //     }
        //     let accidentalInjuries = "";
        //     let room = "Private";
        //     let hopstalBenifit;
        //     let ambulanceExpense = "3,500";
        //     if (productName.includes("family")) {
        //         if (planName.includes("diamond")) {
        //             hospitalLimit = "750,000";
        //             accidentalInjuries = "50,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "4,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "862,500";
        //             }
        //         }
        //         if (planName.includes("platinum")) {
        //             hospitalLimit = "1,000,000";
        //             accidentalInjuries = "50,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "4,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "1,150,000";
        //             }
        //         }
        //         if (planName.includes("gold")) {
        //             hospitalLimit = "550,000";
        //             accidentalInjuries = "50,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "3,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "632,500";
        //             }
        //         } else if (planName.includes("silver")) {
        //             hospitalLimit = "275,000";
        //             accidentalInjuries = "50,000";
        //             room = "Semi-Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "2,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "316,250";
        //             }
        //         }


        //     }
        //     if (productName.includes("personal")) {
        //         if (planName.includes("diamond")) {
        //             hospitalLimit = "750,000";
        //             accidentalInjuries = "50,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "4,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "862,500";
        //             }
        //         }
        //         if (planName.includes("platinum")) {
        //             hospitalLimit = "1,000,000";
        //             accidentalInjuries = "50,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "5,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "1,150,000";
        //             }
        //         }
        //         if (planName.includes("gold")) {
        //             hospitalLimit = "550,000";
        //             accidentalInjuries = "50,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "3,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "632,500";
        //             }

        //         } else if (planName.includes("silver")) {
        //             hospitalLimit = "275,000";
        //             accidentalInjuries = "50,000";
        //             room = "Semi-Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "2,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "316,250";
        //             }

        //         } else if (planName.includes("bronze")) {
        //             hospitalLimit = "125,000";
        //             accidentalInjuries = "50,000";
        //             room = "General Ward";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "1,500";
        //             if (policy?.policy_code?.includes("-R")
        //                 && !policy?.policy_code?.includes("-R1")
        //                 && !policy?.policy_code?.includes("-R2")) {
        //                 hospitalLimit = "143,750";
        //             }
        //         }


        //     }
        //     if (isFaysalBankOrder) {

        //         if (planName.includes("gold")) {
        //             hospitalLimit = "600,000";
        //             accidentalInjuries = "150,000";
        //             room = "Private";
        //             hopstalBenifit = "12,000";
        //             ambulanceExpense = "5,000";
        //         } else if (planName.includes("silver")) {
        //             hospitalLimit = "400,000";
        //             accidentalInjuries = "100,000";
        //             room = "Semi Private";
        //             hopstalBenifit = "8,000";
        //             ambulanceExpense = "4,000";

        //         } else {
        //             hospitalLimit = "200,000";
        //             accidentalInjuries = "50,000";
        //             room = "Semi Private";
        //             hopstalBenifit = "4,000";
        //             ambulanceExpense = "2,000";
        //         }
        //     }
        //     let accidentalDeathCoverageLimit = "";
        //     if (isSCBOrder) {
        //         if (planName.includes("silver")) {
        //             hospitalLimit = "500,000";
        //             accidentalInjuries = "100,000";
        //             room = "20,000";
        //             //hopstalBenifit = "12,000";
        //             ambulanceExpense = "Covered";
        //             accidentalDeathCoverageLimit = "500,000";
        //         } else if (planName.includes("gold")) {
        //             hospitalLimit = "750,000";
        //             accidentalInjuries = "150,000";
        //             room = "35,000";
        //             //hopstalBenifit = "12,000";
        //             ambulanceExpense = "Covered";
        //             accidentalDeathCoverageLimit = "750,000";
        //         } else if (planName.includes("platinum")) {
        //             hospitalLimit = "1,000,000";
        //             accidentalInjuries = "250,000";
        //             room = "35,000";
        //             //hopstalBenifit = "12,000";
        //             ambulanceExpense = "Covered";
        //             accidentalDeathCoverageLimit = "1,000,000";
        //         }
        //     }
        //     if (isHMBOrder) {
        //         if (planName.includes("bronze")) {
        //             hospitalLimit = "150,000";
        //             accidentalInjuries = "100,000";
        //             room = "Semi Private";
        //             //hopstalBenifit = "12,000";
        //             ambulanceExpense = "Covered";
        //             //accidentalDeathCoverageLimit = "500,000";
        //         } else if (planName.includes("silver")) {
        //             hospitalLimit = "500,000";
        //             accidentalInjuries = "150,000";
        //             room = "Private";
        //             //hopstalBenifit = "12,000";
        //             ambulanceExpense = "Covered";
        //             //accidentalDeathCoverageLimit = "750,000";
        //         } else if (planName.includes("gold")) {
        //             hospitalLimit = "1,000,000";
        //             accidentalInjuries = "300,000";
        //             room = "Private";
        //             //hopstalBenifit = "12,000";
        //             ambulanceExpense = "Covered on actual basis";
        //             //accidentalDeathCoverageLimit = "1,000,000";
        //         }
        //     }
        //     if (isFranchiseOrder) {
        //         hospitalLimit = "50,000";
        //         accidentalInjuries = "50,000";
        //         room = "1000";
        //         hopstalBenifit = "4,000";
        //         ambulanceExpense = "1,000";

        //     }

        //     currentY = doc.y + 1.2;
        //     drawTable(doc, [
        //         ["Plan", planName.toUpperCase()],
        //         ["Hospitalization Limits", `${hospitalLimit}/-`]
        //     ], {
        //         x: 15,
        //         y: currentY,
        //         columnWidths: [400, 165],
        //         headers: [],
        //     });

        //     currentY = doc.y + 10;
        //     drawTable(doc, [
        //         ["Sub Limits"],
        //     ], {
        //         x: 15,
        //         y: currentY,
        //         columnWidths: [565],
        //         headers: [],
        //     });

        //     currentY = doc.y + 1.2;
        //     drawTable(doc, [
        //         ["Room & Board (Per Day)", room],
        //         ["Pre hospitalization Expenses", "30 Days"],
        //         ["Post hospitalization Expenses", "30 Days"],
        //         ["Emergency Local Ambulance Expenses", `${ambulanceExpense}`],
        //         ["Emergency International Expenses", "Covered"],
        //         ["Medical Second Option", "Covered"],
        //         ["Increase in Hospitalization due to accidental Injuries", `${accidentalInjuries}`],
        //         ["Maternity Expenses", "Normal   30,000\nc-section   45,000"],
        //         ["Emergency Accidental Outpatient Expenses", "Covered"],
        //         ["Emergency Accidental Dental Expense", "Covered"],
        //         ["Accidental Death Coverage", accidentalDeathCoverageLimit]
        //     ], {
        //         x: 15,
        //         y: currentY,
        //         columnWidths: [400, 165],
        //         headers: [],
        //     });
        // }
        else {
            const productName = policy.product.product_name.toLowerCase();
            const planName = policy.plan.name.toLowerCase();
            let isParent = false;

            let tableHeading = "FAMILY HEALTH CARE";
            if (isFaysalBankOrder) {
                if (productName.includes("family")) {
                    tableHeading = "Takaful Family Health Cover";
                } else {
                    tableHeading = "Takaful Health Cover";
                }
            } else if (isHBLMFBOrder) {
                tableHeading = "SelfCare (Accidental Death, Disability & Medical Expense Insurance Cover)";
            } else if (productName.includes("personal")) {
                tableHeading = "PERSONAL HEALTH CARE";
            } else if (productName.includes("hercare")) {
                tableHeading = "HER CARE";
            } else if (productName.includes("mib") && productName.includes("family")) {
                tableHeading = "MIB FAMILY HEALTH PLAN";
            } else if (productName.includes("hbl")) {
                tableHeading = "HBL Daily Hospital Cash";
            } else if (productName.includes("shifa-daily")) {
                tableHeading = "SHIFA-Daily Cash Insurance";
            } else if (isSCBOrder) {
                tableHeading = "HOSPITAL TAKAFUL COVER";
            } else if (isHMBOrder) {
                tableHeading = "COMPREHENSIVE HEALTH COVER";
            } else {
                tableHeading = "FAMILY HEALTH CARE";
            }

            drawTable(doc, [], {
                x: 15,
                y: currentY,
                columnWidths: [565],
                headers: [tableHeading],
            });

            currentY = doc.y + 1.2;

            let benefitTableHeading = "Product Benefit Table";
            if (productName.includes("parent")) {
                isParent = true;
                benefitTableHeading = "Product Benefit Table / Per Annum / Per Parent";
            }

            drawTable(doc, [], {
                x: 15,
                y: currentY,
                columnWidths: [565],
                headers: [benefitTableHeading],
            });

            let hospitalLimit = "550,000";
            if (productName.includes("hercare")) {
                if (planName.includes("platinum")) {
                    hospitalLimit = "1,000,000";
                } else if (planName.includes("diamond")) {
                    hospitalLimit = "750,000";
                } else if (planName.includes("gold")) {
                    hospitalLimit = "500,000";
                }
            }
            let accidentalInjuries = "";
            let room = "Private";
            let hopstalBenifit = "12,000";
            let ambulanceExpense = "3,500";
            if (productName.includes("family")) {
                if (planName.includes("diamond")) {
                    hospitalLimit = "750,000";
                    accidentalInjuries = "50,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "4,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "862,500";
                    }
                }
                if (planName.includes("platinum")) {
                    hospitalLimit = "1,000,000";
                    accidentalInjuries = "50,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "4,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "1,150,000";
                    }
                }
                if (planName.includes("gold")) {
                    hospitalLimit = "550,000";
                    accidentalInjuries = "50,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "3,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "632,500";
                    }
                } else if (planName.includes("silver")) {
                    hospitalLimit = "275,000";
                    accidentalInjuries = "50,000";
                    room = "Semi-Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "2,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "316,250";
                    }
                }
            }
            if (productName.includes("personal")) {
                if (planName.includes("diamond")) {
                    hospitalLimit = "750,000";
                    accidentalInjuries = "50,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "4,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "862,500";
                    }
                }
                if (planName.includes("platinum")) {
                    hospitalLimit = "1,000,000";
                    accidentalInjuries = "50,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "5,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "1,150,000";
                    }
                }
                if (planName.includes("gold")) {
                    hospitalLimit = "550,000";
                    accidentalInjuries = "50,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "3,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "632,500";
                    }

                } else if (planName.includes("silver")) {
                    hospitalLimit = "275,000";
                    accidentalInjuries = "50,000";
                    room = "Semi-Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "2,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "316,250";
                    }

                } else if (planName.includes("bronze")) {
                    hospitalLimit = "125,000";
                    accidentalInjuries = "50,000";
                    room = "General Ward";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "1,500";
                    if (policy?.policy_code?.includes("-R")
                        && !policy?.policy_code?.includes("-R1")
                        && !policy?.policy_code?.includes("-R2")) {
                        hospitalLimit = "143,750";
                    }
                }
            }
            if (isFaysalBankOrder) {

                if (planName.includes("gold")) {
                    hospitalLimit = "600,000";
                    accidentalInjuries = "150,000";
                    room = "Private";
                    hopstalBenifit = "12,000";
                    ambulanceExpense = "5,000";

                } else if (planName.includes("silver")) {
                    hospitalLimit = "400,000";
                    accidentalInjuries = "100,000";
                    room = "Semi Private";
                    hopstalBenifit = "8,000";
                    ambulanceExpense = "4,000";

                } else {
                    hospitalLimit = "200,000";
                    accidentalInjuries = "50,000";
                    room = "Semi Private";
                    hopstalBenifit = "4,000";
                    ambulanceExpense = "2,000";
                }
            }
            let accidentalDeathCoverageLimit = "";
            if (isSCBOrder) {
                if (planName.includes("silver")) {
                    hospitalLimit = "500,000";
                    accidentalInjuries = "100,000";
                    room = "20,000";
                    ambulanceExpense = "Covered";
                    accidentalDeathCoverageLimit = "500,000";
                } else if (planName.includes("gold")) {
                    hospitalLimit = "750,000";
                    accidentalInjuries = "150,000";
                    room = "35,000";
                    ambulanceExpense = "Covered";
                    accidentalDeathCoverageLimit = "750,000";
                } else if (planName.includes("platinum")) {
                    hospitalLimit = "1,000,000";
                    accidentalInjuries = "250,000";
                    room = "35,000";
                    ambulanceExpense = "Covered";
                    accidentalDeathCoverageLimit = "1,000,000";
                }
            }
            if (isHMBOrder) {
                if (planName.includes("bronze")) {
                    hospitalLimit = "150,000";
                    accidentalInjuries = "100,000";
                    room = "Semi Private";
                    ambulanceExpense = "Covered";
                } else if (planName.includes("silver")) {
                    hospitalLimit = "500,000";
                    accidentalInjuries = "150,000";
                    room = "Private";
                    ambulanceExpense = "Covered";
                } else if (planName.includes("gold")) {
                    hospitalLimit = "1,000,000";
                    accidentalInjuries = "300,000";
                    room = "Private";
                    ambulanceExpense = "Covered on actual basis";
                }
            }
            if (isFranchiseOrder) {
                hospitalLimit = "50,000";
                accidentalInjuries = "50,000";
                room = "1000";
                hopstalBenifit = "4,000";
                ambulanceExpense = "1,000";
            }

            if (isParent) {
                if (planName.includes("platinum")) {
                    hospitalLimit = "500,000";
                    room = "Private";
                } else if (planName.includes("gold")) {
                    hospitalLimit = "300,000";
                    room = "Private";
                } else if (planName.includes("silver")) {
                    hospitalLimit = "200,000";
                    room = "Semi-pvt";
                } else if (planName.includes("titanium")) {
                    if (planName.includes("plus")) {
                        hospitalLimit = "1,000,000";
                    } else {
                        hospitalLimit = "700,000";
                    }
                    room = "Private";
                }
                tableHeading = "PARENT CARE";
            }

            currentY = doc.y + 1.4;

            if (isHBLMFBOrder) {
                let accidentalDeath = "";
                let accidentalMedicalExpense = "";
                let totalSumInsured = "";
                let netPremiumMonthly = "";
                if (policy.plan.name === "Plan A") {
                    accidentalDeath = "100,000";
                    accidentalMedicalExpense = "10,000";
                    totalSumInsured = "110,000";
                    netPremiumMonthly = "Rs. 75";
                } else if (policy.plan.name === "Plan B") {
                    accidentalDeath = "300,000";
                    accidentalMedicalExpense = "30,000";
                    totalSumInsured = "330,000";
                    netPremiumMonthly = "Rs. 200";
                } else if (policy.plan.name === "Plan C") {
                    accidentalDeath = "500,000";
                    accidentalMedicalExpense = "50,000";
                    totalSumInsured = "550,000";
                    netPremiumMonthly = "Rs. 350";
                }

                drawTable(doc, [
                    ["Plan", policy.plan.name],
                    ["Accidental Death & Permanent Disability", accidentalDeath],
                    ["Accidental Medical Expense", accidentalMedicalExpense],
                    ["Total Sum Insured", totalSumInsured],
                    ["Net Premium Monthly- auto payment", netPremiumMonthly],
                    ["Commission", "20% on Gross Premium"]
                ], {
                    x: 15,
                    y: currentY,
                    columnWidths: [400, 165],
                    headers: [],
                });
            } else if (productName.includes("hbl")) {
                let hospitalBenefits = "";
                let surgeryBenefits = "";
                let accidentBenefits = "";
                let icuBenefits = "";
                let dailyCashMaxLimit = "";
                let surgeryMaxLimit = "";
                let icuMaxLimit = "";
                let premium = "";
                if (policy.plan.name === "Plan A") {
                    hospitalBenefits = "1,000";
                    surgeryBenefits = "1,500";
                    accidentBenefits = "1,500";
                    icuBenefits = "1,500";
                    dailyCashMaxLimit = "30,000";
                    surgeryMaxLimit = "45,000";
                    icuMaxLimit = "45,000";
                    premium = "1,700";
                } else if (policy.plan.name === "Plan B") {
                    hospitalBenefits = "3,000 ";
                    surgeryBenefits = "4,500";
                    accidentBenefits = "4,500";
                    icuBenefits = "4,500";
                    dailyCashMaxLimit = "90,000";
                    surgeryMaxLimit = "135,000";
                    icuMaxLimit = "135,000";
                    premium = "5,060";
                } else if (policy.plan.name === "Plan C") {
                    hospitalBenefits = "5,000 ";
                    surgeryBenefits = "7,500";
                    accidentBenefits = "7,500";
                    icuBenefits = "7,500";
                    dailyCashMaxLimit = "150,000";
                    surgeryMaxLimit = "225,000";
                    icuMaxLimit = "225,000";
                    premium = "7,890";
                }

                drawTable(doc, [
                    ["Daily Cash", "Rs./Day"],
                    ["Min 2 days & 10 days Max one Confinement & 30 days in a year\n1. Pays daily benefit for as long as the policyholder is confined to the hospital. The amount will depend on the nature of hospitalization and the mode of treatment.", hospitalBenefits],
                    ["2- The benefit payable is increased by 50% if the hospitalization is due to surgery", surgeryBenefits],
                    ["3- The benefit payable is increased by 50% if the hospitalization is due to accident.", accidentBenefits],
                    ["4- The benefit payable is increased by 50% if the patient is confined to an ICU.", icuBenefits],
                    ["Daily Cash Max Limit in Aggregate", dailyCashMaxLimit],
                    ["In Case of Surgery/Accident Max Limit", surgeryMaxLimit],
                    ["In Case of ICU Treatment Max Limit", icuMaxLimit],
                    ["Premium", premium]
                ], {
                    x: 15,
                    y: currentY,
                    columnWidths: [400, 165],
                    headers: [],
                });
            } else if (productName.includes("shifa-daily")) {
                let dailyBenifit = "";
                let surgeryOrAccidentBenifit = "";
                let icuBenifit = "";
                let dailyCashMaxLimit = "";
                let surgeryOrAccidentMaxLimit = "";
                let icuMaxLimit = "";
                let premium = "";
                if (policy.plan.name === "SHIFA Silver") {
                    dailyBenifit = "5,000";
                    surgeryOrAccidentBenifit = "7,500";
                    icuBenifit = "10,000";
                    dailyCashMaxLimit = "900,000";
                    surgeryOrAccidentMaxLimit = "1,350,000";
                    icuMaxLimit = "1,800,000";
                    premium = "2,500";
                } else if (policy.plan.name === "SHIFA Gold") {
                    dailyBenifit = "10,000";
                    surgeryOrAccidentBenifit = "15,000";
                    icuBenifit = "20,000";
                    dailyCashMaxLimit = "1,800,000";
                    surgeryOrAccidentMaxLimit = "2,700,000";
                    icuMaxLimit = "3,600,000";
                    premium = "5,000";
                }

                drawTable(doc, [
                    ["This product shall provide coverage to the insured person in case of hospitalization due to illness or accident. Where a fixed daily amount for the number of hospitalization days will be reimbursed to assured person as per the plan selected.\n-Minimum 24 hours & maximum 180 days hospitalization in a year.\n-While the number of days for cases of ICU /accident /surgery will be up to 15 days max per confinement.", "Rs./Day"],
                    [" 1. Pays daily benefit for as long as the policyholder is confined to the hospital. The amount will depend on the nature of hospitalization and the mode of treatment. ", dailyBenifit],
                    [" 2. The benefit payable is increased by 50% if the hospitalization is due to surgery & accident", surgeryOrAccidentBenifit],
                    [" 3. The benefit payable is increased by 100% if the patient is confined to an ICU.", icuBenifit],
                    ["Daily Cash Max Limit in Aggregate", dailyCashMaxLimit],
                    ["In Case of Surgery/Accident Max Limit", surgeryOrAccidentMaxLimit],
                    ["In Case of ICU Treatment Max Limit", icuMaxLimit],
                    ["NET PREMIUM (Incl.Taxes & Levis) ", premium]
                ], {
                    x: 15,
                    y: currentY,
                    columnWidths: [400, 165],
                    headers: [],
                });
            } else if (!productName.includes("hbl") && !productName.includes("shifa-daily") && !productName.includes("sehat plan")) {
                let hospitalizationHeading = "Hospitalization Limits";
                if (isHMBOrder) {
                    hospitalizationHeading = "Annual Hospitalization Limit";
                }

                drawTable(doc, [
                    ["Plan", policy.plan.name],
                    [hospitalizationHeading, hospitalLimit]
                ], {
                    x: 15,
                    y: currentY,
                    columnWidths: [400, 165],
                    headers: [],
                });

                currentY = doc.y + 1.4;

                drawTable(doc, [
                    ["Sub Limits"],
                ], {
                    x: 15,
                    y: currentY,
                    columnWidths: [565],
                    headers: [],
                });

                currentY = doc.y + 1.4;

                let subLimitRows = [];
                let roomHeading = "Room & Board (Per Day)";
                if (isHMBOrder) {
                    roomHeading = "Room Entitlement";
                }
                subLimitRows.push([roomHeading, room]);

                if (isParent) {
                    subLimitRows.push(["ICU / Operation Theatre charges", "Actual"]);
                    subLimitRows.push(["Ambulance - per Hospitalization / per policy", "3,000"]);
                    subLimitRows.push(["Pre hospitalization Expenses", "30 Days"]);
                    subLimitRows.push(["Post hospitalization Expenses", "30 Days"]);
                    subLimitRows.push(["Day-Care Procedures & Specialized Investigations in outpatient setting including but not limited to: Dialysis, Cataract Surgery, MRI, CT Scan, Endoscopy, Thallium Scan, Angiography, Treatment of Fracture. Emergency dental treatment due to accidental injuries within 48 hours(forpain relief only) ", "Covered"]);
                } else {
                    let prePostHeading = "Pre hospitalization Expenses";
                    let prePostValue = "30 Days";
                    if (isHMBOrder) {
                        prePostHeading = "Pre & Post Hospitalization Exp:\nCovering Consultation, Medicines, and \nlab tests preceding admission to the hospital \nand after discharge from hospital";
                    }
                    subLimitRows.push([prePostHeading, prePostValue]);
                    subLimitRows.push(["Post hospitalization Expenses", "30 Days"]);
                    subLimitRows.push(["Emergency Local Ambulance Expenses", ambulanceExpense]);
                    if (!isFranchiseOrder) {
                        let internationalValue = "Covered";
                        if (isHMBOrder) {
                            internationalValue = "Covered Reasonable & Customary charges only for emergency hospitalization abroad";
                        }
                        subLimitRows.push(["Emergency International Expenses", internationalValue]);
                    }
                }

                if (productName.includes("mib")) {
                    subLimitRows.push(["Increase in Hospitalization due to accidental Injuries", accidentalInjuries]);
                }

                if (isFaysalBankOrder) {
                    subLimitRows.push(["Increase in Hospitalization due to accidental Injuries", accidentalInjuries]);
                    subLimitRows.push(["Day Care procedures and specialized investigation ", "Covered"]);
                    subLimitRows.push(["Emergency Accidental Outpatient Expenses ", "Covered "]);
                    subLimitRows.push(["Emergency Accidental Dental Expense ", "Covered "]);
                    let maternityHeading = "Maternity Expenses";
                    let maternityValue = "Normal   30,000\nc-section   45,000";
                    if (productName.includes("family")) {
                        maternityHeading = "Pre Existing Conditions Coverage";
                        maternityValue = "1st year 20% of annual limit\n 2nd year 50% of annual limit\n 3rd year 100% of annual limit\n";
                    }
                    subLimitRows.push([maternityHeading, maternityValue]);
                }

                if (isSCBOrder) {
                    subLimitRows.push(["Increase in Hospitalization due to accidental Injuries", accidentalInjuries]);
                    subLimitRows.push(["Day Care procedures and specialized investigation ", "Covered"]);
                    subLimitRows.push(["Emergency Accidental Outpatient Expenses ", "Covered "]);
                    subLimitRows.push(["Emergency Accidental Dental Expense ", "Covered "]);
                    subLimitRows.push(["Accidental Death Coverage", accidentalDeathCoverageLimit]);
                } else if (isHMBOrder) {
                    subLimitRows.push(["Increase in Hospitalization due to accidental Injuries", accidentalInjuries]);
                    let dayCareHeading = "Day Care procedures and specialized investigation ";
                    let dayCareValue = "Covered";
                    if (isHMBOrder) {
                        dayCareHeading = "Day Care procedures and specialized investigation: \nDialysis, Cataract Surgery, MRI, CT scan, Endoscopy, \nThallium Scan, Angiography, and Treatment of Fracture etc.";
                    }
                    subLimitRows.push([dayCareHeading, dayCareValue]);
                    let emergencyAccidentalValue = "Covered";
                    if (isHMBOrder) {
                        emergencyAccidentalValue = "Covered (within 48 hours of an accident only)";
                    }
                    subLimitRows.push(["Emergency Accidental Outpatient Expenses ", emergencyAccidentalValue]);
                    let emergencyDentalValue = "Covered ";
                    if (isHMBOrder) {
                        emergencyDentalValue = "Covered (within 48 hours for pain relief only)";
                    }
                    subLimitRows.push(["Emergency Accidental Dental Expense ", emergencyDentalValue]);
                    subLimitRows.push(["Pre-Existing Conditions Coverage", "1st year 20% of annual limit\n 2nd year 30% of annual limit\n 3rd year 50% of annual limit\n"]);
                } else if (!isFranchiseOrder && !productName.includes("mib")) {
                    subLimitRows.push(["Medical Second Option", "Covered"]);
                }

                if (isParent) {
                    subLimitRows.push(["Pre Existing Conditions & Congenital Anomalies", "a. 1st Year 10% of Annual Limit.\nb. 2nd Year 20% of Annual Limit.\nc. 3rd Year 30% of Annual Limit.\nd. 4th Year & onward 50% of Annual Limit."]);
                    subLimitRows.push(["Online Doctor Consultation*: ", "Covered"]);
                }

                if ((isEasyInsuranceOrder || isMawazanaOrder || isSmartChoiceOrder || isLetsCompareOrder) && !isParent) {
                    subLimitRows.push(["Online Doctor Consultation*: ", "Covered"]);
                }

                if (!isParent) {
                    subLimitRows.push(["Increase in Hospitalization due to accidental Injuries", accidentalInjuries]);
                    subLimitRows.push(["Maternity Expenses", "Normal   30,000\nc-section   45,000"]);
                    subLimitRows.push(["Day Care procedures and specialized investigation ", "Covered"]);
                    subLimitRows.push(["Emergency Accidental Outpatient Expenses ", "Covered "]);
                    subLimitRows.push(["Emergency Accidental Dental Expense ", "Covered "]);
                }

                drawTable(doc, subLimitRows, {
                    x: 15,
                    y: currentY,
                    columnWidths: [400, 165],
                    headers: [],
                });
            }

            currentY = doc.y + 6;

            if (isParent || isEasyInsuranceOrder || isMawazanaOrder || isSmartChoiceOrder || isLetsCompareOrder) {
                const wording = "* Online Doctor Consultation is being provided by, owned, and operated by a third party “Sehat Kahani”, over which Jubilee General has no control, neither Jubilee assumes any liability arising due to the quality of service being provided by the third-party vendor.";
                drawTable(doc, [[wording]], {
                    x: 15,
                    y: currentY,
                    columnWidths: [565],
                    headers: [],
                });
            }
        }

    }
    // 
    // 
    // 
    // 
    // 
    // Header Start
    const jubileeImage = policy && policy.takaful_policy ? `${__dirname}../../../../assets/logo/takaful_logo.png` : `${__dirname}../../../../assets/logo/insurance_logo.png`;
    let productLogo = `${__dirname}../../../../assets/logo/family.png`;

    if (policy.productOption.webappMappers.some(mapper => mapper.child_sku.toLowerCase().includes("personal"))) {
        productLogo = `${__dirname}../../../../assets/logo/personal.png`;
    } else if (productName.includes("lifestyle")) {
        productLogo = `${__dirname}../../../../assets/logo/lifestyle.png`;
    } else if (productName.includes("Parents-Care-Plus")) {
        productLogo = `${__dirname}../../../../assets/logo/parent-care-plus-icon.png`;
    }else if (productName.includes("parent")) {
        productLogo = `${__dirname}../../../../assets/logo/parent.png`;
    } else if (productName.includes("hercare")) {
        productLogo = `${__dirname}../../../../assets/logo/HC-HerCare.png`;
    } else if (isFaysalBankOrder) {
        if (productName.includes("family")) {
            productLogo = `${__dirname}../../../../assets/logo/family.png`; // Change
        } else if (productName.includes("personal accident")) {
            productLogo = `${__dirname}../../../../assets/logo/personal-accident.png`;
        } else if (productName.includes("female centric health takaful")) {
            productLogo = `${__dirname}../../../../assets/logo/female.png`;
        } else {
            productLogo = `${__dirname}../../../../assets/logo/family.png`; // Change
        }
    } else if (productName.includes("mib") && productName.includes("family")) {
        productLogo = `${__dirname}../../../../assets/logo/family.png`;
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