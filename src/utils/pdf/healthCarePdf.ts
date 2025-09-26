// export function addHealthDetails(doc: InstanceType<typeof PDFDocument>, policy: any) {
//     doc.fontSize(14).text("Health Policy Details", { underline: true }).moveDown(0.5);
//     const yStart = doc.y;
//     drawTableRow(doc, yStart, ["Plan", "Contribution"], [policy.plan?.name || "N/A", policy.contribution || "PKR 18000/-"], [250, 250]);
//     drawTableRow(doc, yStart + 25, ["Takaful", "Tax Status"], [policy.takaful_policy ? "Yes" : "No", policy.tax_status || "Filer"], [250, 250]);
//     // Add more health-specific rows as needed, e.g., for pre-existing conditions coverage
//     doc.moveDown();
// }