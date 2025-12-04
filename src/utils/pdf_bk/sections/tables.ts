import PDFDocument from "pdfkit";

export function drawTableRow(doc: InstanceType<typeof PDFDocument>, y: number, labels: string[], values: string[], widths: number[]) {
    let x = 20;
    labels.forEach((label, i) => {
        doc.font("Helvetica-Bold").text(label, x, y);
        doc.font("Helvetica").text(values[i], x + widths[i] / 2, y);
        x += widths[i];
    });
    // doc.moveTo(50, y + 20).lineTo(550, y + 20).stroke(); // Horizontal line
}

export function addPolicyDetailsTable(doc: InstanceType<typeof PDFDocument>, policy: any) {
    doc.fontSize(10).text("Policy Details").moveDown(0.5);

    doc = doc.fontSize(8);
    const yStart = doc.y;

    doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    doc.moveTo(15, yStart - 5).lineTo(15, yStart + 27).stroke(); // vertical line

    drawTableRow(doc, yStart, ["Policy Number", "Place of Issue"], ["910000000019", "Karachi"], [250, 250]);
    drawTableRow(doc, yStart + 15, ["Issue Date/Time", "Policy Type"], [new Date().toLocaleString(), "Student Travel"], [250, 250]);

    doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 27).stroke(); // vertical line
    doc.moveTo(15, yStart + 27).lineTo(doc.page.width - 15, yStart + 27).stroke(); // Horizontal line

    doc.moveDown(1.5);
}

export function addInsuredDetailsTable(doc: InstanceType<typeof PDFDocument>, policy: any) {
    let x = 20;
    doc.fontSize(10).font("Helvetica-Bold").text("Insured Details", x).moveDown(0.5);

    doc = doc.fontSize(8);
    const yStart = doc.y;

    doc.moveTo(15, yStart - 5).lineTo(doc.page.width - 15, yStart - 5).stroke(); // Horizontal line
    doc.moveTo(15, yStart - 5).lineTo(15, yStart + 85).stroke(); // vertical line

    drawTableRow(doc, yStart, ["Name", "CNIC"], ["Maryum Firdous", "42201-4609354-0"], [250, 250]);
    drawTableRow(doc, yStart + 15, ["Address"], ["D-66 First Floor Shamsi Society, Wireless Gate, Near Malir Halt Karachi"], [250]);
    drawTableRow(doc, yStart + 30, ["Phone", "Passport No."], ["0335-0131745", "CL8973542"], [250, 250]);
    drawTableRow(doc, yStart + 45, ["Email", "Name Beneficiary"], ["maryum.uok@gmail.com ", "Zaid Affan"], [250, 250]);
    drawTableRow(doc, yStart + 60, ["Date of Birth", "Relationship with Beneficiary"], ["February 06, 1987", "Brother"], [250, 250]);
    drawTableRow(doc, yStart + 75, ["Age", "Beneficiary Contact No."], ["38", "0333-2822081"], [250, 250]);

    doc.moveTo(doc.page.width - 15, yStart - 5).lineTo(doc.page.width - 15, yStart + 85).stroke(); // vertical line
    doc.moveTo(15, yStart + 85).lineTo(doc.page.width - 15, yStart + 85).stroke(); // Horizontal line

    doc.moveDown(1.5);
}

export function addBenefitPlansTable(doc: InstanceType<typeof PDFDocument>, policy: any) {
    doc.fontSize(14).text("Benefit Plans", { underline: true }).moveDown(0.5);
    const yStart = doc.y;
    drawTableRow(doc, yStart, ["Plan", "Hospitalization Limits"], [policy.plan?.name || "N/A", policy.sum_insured], [250, 250]);
    // Add sub-limits, pre/post hospitalization, etc., as rows
    doc.moveDown();
}