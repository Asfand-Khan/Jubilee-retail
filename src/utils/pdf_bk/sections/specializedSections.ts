// import PDFDocument from "pdfkit";

// export function addHealthPolicy(doc: InstanceType<typeof PDFDocument>, policy: any) {
//   doc.fontSize(14).text("Health Policy Details", { underline: true }).moveDown();

//   doc.fontSize(12).text(`Plan: ${policy.plan?.name || "N/A"}`);
//   doc.text(`Coverage: ${policy.sum_insured}`);
//   doc.text(`Premium: ${policy.received_premium}`);
//   doc.text(`Takaful: ${policy.takaful_policy ? "Yes" : "No"}`);
// }

// export function addTravelPolicy(doc: InstanceType<typeof PDFDocument>, policy: any) {
//   doc.fontSize(14).text("Travel Policy Details", { underline: true }).moveDown();

//   doc.fontSize(12).text(`Destination: ${policy.PolicyTravel?.destination}`);
//   doc.text(
//     `Travel Dates: ${policy.PolicyTravel?.travel_start_date} → ${policy.PolicyTravel?.travel_end_date}`
//   );
//   doc.text(`Sponsor: ${policy.PolicyTravel?.sponsor || "N/A"}`);
// }

import PDFDocument from "pdfkit";
import { drawTableRow } from "./tables";  // Import drawTableRow from tables.ts to resolve the scope error

export function addTravelDetails(doc: InstanceType<typeof PDFDocument>, travel: any) {
    let x = 20;
    doc.fontSize(10).font("Helvetica-Bold").text("Travel Details", x).moveDown(0.5);

    doc = doc.fontSize(8);
    const yStart = doc.y;

    doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    doc.moveTo(15, yStart - 5).lineTo(15, yStart + 60).stroke(); // vertical line

    drawTableRow(doc, yStart, ["Destination", "Plan"], ["United Kingdom", "6 months / Gold"], [250, 250]);
    drawTableRow(doc, yStart + 15, ["Departure Date", "Stay"], ["October 01, 2025", "Upto 6 Months Without Tuition Fee"], [250, 250]);
    drawTableRow(doc, yStart + 30, ["Arrival Date", "Net Premium"], ["April 01, 2026", "19,672/-"], [250, 250]);
    drawTableRow(doc, yStart + 45, ["Travel From"], ["Karachi"], [250]);  // Single column for wider fields

    doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 60).stroke(); // vertical line
    doc.moveTo(15, yStart + 60).lineTo(doc.page.width - 15, yStart + 60).stroke(); // Horizontal line

    doc.moveDown(1.5);
}

export function addProgramDetails(doc: InstanceType<typeof PDFDocument>, travel: any) {
    let x = 20;
    doc.fontSize(10).font("Helvetica-Bold").text("Program Details", x).moveDown(0.5);

    doc = doc.fontSize(8);
    const yStart = doc.y;

    doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    doc.moveTo(15, yStart - 5).lineTo(15, yStart + 30).stroke(); // vertical line

    drawTableRow(doc, yStart, ["Institute", "Program Name"], ["Coventry University", "PhD- Visiting Researcher"], [250, 250]);
    drawTableRow(doc, yStart + 15, ["Program Duration", "Offer Letter"], ["6 Month Years", "AMCVR001"], [250, 250]);

    doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 30).stroke(); // vertical line
    doc.moveTo(15, yStart + 30).lineTo(doc.page.width - 15, yStart + 30).stroke(); // Horizontal line

    doc.moveDown(1.5);
}

export function addSponsorDetails(doc: InstanceType<typeof PDFDocument>, travel: any) {
    let x = 20;
    doc.fontSize(10).font("Helvetica-Bold").text("Sponsor Details", x).moveDown(0.5);

    doc = doc.fontSize(8);
    const yStart = doc.y;

    doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    doc.moveTo(15, yStart - 5).lineTo(15, yStart + 35).stroke(); // vertical line

    drawTableRow(doc, yStart, ["Sponsor", "Sponsor's Contact No."], ["Commonwealth UK", "foi@cscuk.org.uk"], [250, 250]);
    drawTableRow(doc, yStart + 15, ["Sponsor Address"], ["Address Commonwealth Scholarship commission in the UK, Woburn House, 20-24 Tavistock Square, London, WC1H 9HF, United Kingdom"], [250]);  // Wider single column for address

    doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 35).stroke(); // vertical line
    doc.moveTo(15, yStart + 35).lineTo(doc.page.width - 15, yStart + 35).stroke(); // Horizontal line

    doc.moveDown();
}

export function addHealthDetails(doc: InstanceType<typeof PDFDocument>, policy: any) {
    doc.fontSize(14).text("Health Policy Details", { underline: true }).moveDown(0.5);
    const yStart = doc.y;
    drawTableRow(doc, yStart, ["Plan", "Contribution"], [policy.plan?.name || "N/A", policy.contribution || "PKR 18000/-"], [250, 250]);
    drawTableRow(doc, yStart + 25, ["Takaful", "Tax Status"], [policy.takaful_policy ? "Yes" : "No", policy.tax_status || "Filer"], [250, 250]);
    // Add more health-specific rows as needed, e.g., for pre-existing conditions coverage
    doc.moveDown();
}