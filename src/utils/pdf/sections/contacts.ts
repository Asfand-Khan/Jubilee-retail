import PDFDocument from "pdfkit";

export function addAssistanceContacts(doc: InstanceType<typeof PDFDocument>, policy: any) {
  doc.fontSize(12).text("For Claims, Complaints or Queries: ..."); // Add full contact details from samples
  // Add worldwide assistance sections with tel, email for different regions
}