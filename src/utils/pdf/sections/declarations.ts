import PDFDocument from "pdfkit";

export function addDeclarationsAndExclusions(doc: InstanceType<typeof PDFDocument>, policy: any) {
    let x = 20;
    doc
        .fontSize(6.5)
        .text("This Policy covers Hospitalization and Medical Expense for USD 50,000 limit, being higher than the requirement of EU30,000.", x)
        .moveDown(1);
    // List exclusions as numbered text, matching samples
    doc.text("Your Insurance does not cover any claim in any way caused by or resulting from Corona Virus itself and/ or from its fear or threat thereof.", x).moveDown();
    // Add full list from samples
    doc.text(`All Terms, Conditions and Exclusions as per standard Jubilee General CriticalCare Policy wordings and Clauses The agreement to purchase this insurance coverage is a declaration that I/we have read & understood the terms & conditions stated in the policy wordings & clauses and I/we hereby agree to the terms, conditions & exclusions stated therein. I also declare and affirm that I am in good health I hereby declare that all information stated in this schedule is true and complete and that I/we have not concealed any material confirmation from Jubilee General Insurance Company Limited.`, x); // Full declaration text
}