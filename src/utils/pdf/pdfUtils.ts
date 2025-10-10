import PDFDocument from "pdfkit";
import { FullOrder, FullPolicy } from ".";
import { format } from "date-fns/format";


type TableRow = (string | { text: string; bold?: boolean; align?: "left" | "center" | "right" })[];

interface TableOptions {
    x: number;
    y: number;
    columnWidths: number[];
    headers?: string[];
    rowHeight?: number;
}

export function drawTable(
    doc: InstanceType<typeof PDFDocument>,
    rows: TableRow[],
    options: TableOptions
) {
    const { x, y, columnWidths, headers, rowHeight = 15 } = options;

    let startY = y;

    // === Draw Headers ===
    if (headers && headers.length > 0) {
        let startX = x;
        headers.forEach((header, i) => {
            doc.rect(startX, startY, columnWidths[i], rowHeight).stroke();
            doc.font("Helvetica-Bold").text(header, startX + 4, startY + 4, {
                width: columnWidths[i] - 8,
                align: "center",
            });
            startX += columnWidths[i];
        });
        startY += rowHeight;
    }

    // === Draw Rows ===
    rows.forEach((row) => {
        let startX = x;
        let cellHeights: number[] = [];

        // Calculate height for wrapping text per column
        row.forEach((cell, i) => {
            const cellText = typeof cell === "string" ? cell : cell.text;
            const textOptions = {
                width: columnWidths[i] - 5,
                align: typeof cell === "string" ? "left" : cell.align || "left",
            };

            const textHeight = doc.heightOfString(cellText, textOptions) + 5;
            cellHeights.push(textHeight);
        });

        const currentRowHeight = Math.max(...cellHeights, rowHeight);

        // Draw row cells
        row.forEach((cell, i) => {
            const cellText = typeof cell === "string" ? cell : cell.text;
            const isBold = typeof cell !== "string" && cell.bold;
            const align = typeof cell !== "string" ? cell.align || "left" : "left";

            // Draw cell border
            doc.rect(startX, startY, columnWidths[i], currentRowHeight).stroke();

            // Draw text
            doc.font(isBold ? "Helvetica-Bold" : "Helvetica").text(cellText, startX + 4, startY + 4, {
                width: columnWidths[i] - 8,
                align,
            });

            startX += columnWidths[i];
        });

        startY += currentRowHeight;
    });
}

export function drawTableRow(doc: InstanceType<typeof PDFDocument>, y: number, labels: string[], values: string[], widths: number[], bold: boolean = true) {
    let x = 20;
    labels.forEach((label, i) => {
        if (values.length == 0) {
            doc.font("Helvetica").text(label, x, y, {
                align: "center"
            });
        } else {
            bold ?
                doc.font("Helvetica-Bold").text(label, x, y) : doc.font("Helvetica").text(label, x, y)
        }
        doc.font("Helvetica").text(values[i], x + widths[i] / 2, y);
        x += widths[i];
    });
    // doc.moveTo(50, y + 20).lineTo(550, y + 20).stroke(); // Horizontal line
}

export function drawTableRowWithBorders(
    doc: InstanceType<typeof PDFDocument>,
    yStart: number,
    labels: string[],
    values: string[],
    widths: number[]
): void {
    const MARGIN_X = 15;
    const TEXT_PADDING_X = 5;
    const ROW_HEIGHT = 15;

    // Y coordinates for drawing the bounding box lines
    const topEdge = yStart - 2;
    const bottomEdge = yStart + ROW_HEIGHT + 2;

    const effectiveWidth = doc.page.width - 2 * MARGIN_X;

    // --- Case 1: Single Cell (Header/Spacer Row) ---
    if (values.length === 0 && labels.length === 1) {
        const label = labels[0];

        // 1. Draw the text (single cell, centered)
        doc.font("Helvetica-Bold")
            .text(label, MARGIN_X, yStart, {
                width: effectiveWidth,
                align: "center",
                ellipsis: true,
                lineBreak: false
            });

        // 2. Draw Borders (Top, Bottom, Left, Right)
        doc.rect(MARGIN_X, topEdge, effectiveWidth, bottomEdge - topEdge).stroke();
        doc.y = bottomEdge + 2; // Move cursor for next element
        return;
    }

    // --- Case 2: Multi-Cell Row (Label + Value Row) ---

    let currentX = MARGIN_X;

    // 1. Draw Cell Content and Internal Vertical Borders
    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const value = values[i];
        const cellWidth = widths[i];

        // A. Draw Label (Bold, Left-Aligned within the first half/third of the cell)
        // Determine the split point for label vs value space. Using 1/3 for label, 2/3 for value space for alignment.
        const labelWidth = Math.min(cellWidth * 0.4, cellWidth - TEXT_PADDING_X); // Up to 40% of the cell

        doc.font("Helvetica-Bold")
            .text(label, currentX + TEXT_PADDING_X, yStart, {
                width: labelWidth - TEXT_PADDING_X,
                align: "left",
                lineBreak: false,
                ellipsis: true,
                continued: false
            });

        // B. Draw Value (Regular, Center-Aligned in the remaining space of the cell)
        const valueXStart = currentX + labelWidth;
        const valueWidth = cellWidth - labelWidth;

        doc.font("Helvetica")
            .text(value, valueXStart, yStart, {
                width: valueWidth - TEXT_PADDING_X, // Ensure padding margin on right side
                align: "center",
                lineBreak: false,
                ellipsis: true
            });

        // C. Draw Vertical Separator (Draw the line at the end of this cell/start of the next)
        if (i < labels.length - 1) {
            doc.moveTo(currentX + cellWidth, topEdge).lineTo(currentX + cellWidth, bottomEdge).stroke();
        }

        currentX += cellWidth;
    }

    // 2. Draw External Borders (Top, Bottom, Left, Right) - This draws the encompassing box
    doc.rect(MARGIN_X, topEdge, effectiveWidth, bottomEdge - topEdge).stroke();

    // doc.y = bottomEdge + 2; // Set cursor for next element
    doc.moveDown()
}

export const createGeneralApiTable1 = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {

    const apiUser = policy.apiUser;
    const productName = policy.product.product_name.toLowerCase();

    let tableHeading = "Policy Details";
    let policyNumber = "Policy Number";
    let policyType = "Policy";
    let issueDate = "Issue Date/Time";
    let placeOfIssue = "Place of issue";
    let DATE_FORMAT = "MMM dd, yyyy HH:mm:ss";
    let policyTypeValue = "Viacare";

    if (policy.takaful_policy) {
        tableHeading = "Participant's Membership Details";
        policyNumber = "PMD Number";
        policyType = "Document";
    } else {
        console.log("policy was not takaful while creating pdf");
    }
    if (apiUser != null && (apiUser.name.includes("faysalbank") || apiUser.name.includes("scb"))) {
        issueDate = "Issue Date";
        DATE_FORMAT = "MMM dd, yyyy";
    }

    if (productName.includes("hbl-banca")) {
        placeOfIssue = "Place of issuance";
    }

    if (productName.includes("selfcare")) {
        policyTypeValue = "Self Care";
    }
    if (productName.includes("lifestyle")) {
        policyTypeValue = "Lifestyle Care";
    }
    if (productName.includes("homecare")) {
        policyTypeValue = "Homecare";
    }
    if (productName.includes("hercare")) {
        policyTypeValue = "HerCare";
    }
    if (productName.includes("healthcare")) {
        policyTypeValue = "HealthCare";
    }
    if (productName.includes("personal healthcare")) {
        policyTypeValue = "Personal HealthCare";
    }
    if (productName.includes("critical")) {
        policyTypeValue = "Critical Illness";
    }
    if (productName.includes("parent")) {
        policyTypeValue = policy.product.product_type == null ? "HealthCare" : policy.product.product_type.charAt(0).toUpperCase() + policy.product.product_type.slice(1);
    }
    if (
        productName.includes("viacare") ||
        productName.includes("travel") ||
        productName.includes("via care") ||
        policy.PolicyTravel.length > 0
    ) {
        const customerData = policy.policyDetails.find(detail => detail.type.toLowerCase() === "customer");
        if (customerData && customerData.passport_no == null || customerData?.passport_no != null && customerData.passport_no.length == 0) {
            policyTypeValue = "Domestic Travel";
        } else if (productName.trim().includes("via care rest of the world travel insurance")) {
            policyTypeValue = "Multi-Purpose"
        } else { policyTypeValue = "Viacare" };

        if (policy.schengen) {
            policyTypeValue = "Schengen Compliant";
        }
    }
    if (productName.includes("family")) {
        policyTypeValue = "Family HealthCare";
    }
    if (productName.includes("parents")) {
        policyTypeValue = "ParentsCare";
    }
    if (productName.includes("mib") && productName.includes("family")) {
        policyTypeValue = "Family Health Plan";
    }
    if (productName.includes("mib") && productName.includes("personal")) {
        policyTypeValue = "Individual Health Plan";
    }
    if (productName.includes("fbl-takaful health family cover")) {
        policyTypeValue = "Takaful Family Health Cover";
    }
    if (productName.includes("fbl-takaful health cover")) {
        policyTypeValue = "Takaful Health Cover";
    }

    if (productName.includes("fbl-personal accident")) {
        policyTypeValue = "Accident Takaful";
    }

    if (productName.includes("hbl")) {
        policyTypeValue = "Hospital Daily Cash";
    }
    if (productName.includes("shifa-daily")) {
        policyTypeValue = "SHIFA-Daily Cash Insurance";
    }
    if (productName.includes("scb")) {
        //c8 = new PdfPCell(new Phrase("Sehat Takaful Cover", f1));
        policyTypeValue = "Hospital Takaful Cover";
    }
    if (productName.includes("sehat plan")) {
        policyTypeValue = "Comprehensive Health Cover";
    }
    if (productName.includes("parents-care-plus")) {
        policyTypeValue = "Parents Care Plus";
    }
    if (productName.includes("sehat sarmaya")) {
        policyTypeValue = "Comprehensive Health Cover";
    }

    doc.fontSize(10).text(tableHeading).moveDown(0.5);
    doc = doc.fontSize(8);
    const yStart = doc.y;

    doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    doc.moveTo(15, yStart - 5).lineTo(15, yStart + 27).stroke(); // vertical line

    drawTableRow(doc, yStart, [policyNumber, placeOfIssue], [policy.policy_code || "123456789", "Karachi"], [250, 250]);
    drawTableRow(doc, yStart + 15, [issueDate, `${policyType} Type`], [format(new Date(policy.issue_date), DATE_FORMAT), policyTypeValue], [250, 250]);

    doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 27).stroke(); // vertical line
    doc.moveTo(15, yStart + 27).lineTo(doc.page.width - 15, yStart + 27).stroke(); // Horizontal line
}

export const creatHealthcareChildDetail = (doc: InstanceType<typeof PDFDocument>, policy: FullPolicy, order: FullOrder) => {
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