import PDFDocument from "pdfkit";

export function addPolicyTable(doc: InstanceType<typeof PDFDocument>, policies: any[]) {
  doc.fontSize(14).text("Policies", { underline: true }).moveDown(0.5);

  policies.forEach((p, idx) => {
    doc
      .fontSize(12)
      .text(
        `${idx + 1}. ${p.product.product_name} (${p.product.productCategory?.category_name || "N/A"})`
      );
    doc.text(`   Policy Code: ${p.policy_code || "N/A"}`);
    doc.text(`   Sum Insured: ${p.sum_insured}`);
    doc.text(`   Premium: ${p.received_premium}`);
    doc.text(`   Validity: ${p.start_date} → ${p.expiry_date}`);
    doc.moveDown(0.5);
  });
}
