import PDFDocument from "pdfkit";
import { Order } from "@prisma/client";

export function addOrderSummary(doc: InstanceType<typeof PDFDocument>, order: any) {
  doc.fontSize(14).text("Order Summary", { underline: true }).moveDown(0.5);

  doc.fontSize(12).text(`Order Code: ${order.order_code}`);
  doc.text(`Customer: ${order.customer_name}`);
  doc.text(`Email: ${order.customer_email || "N/A"}`);
  doc.text(`Contact: ${order.customer_contact || "N/A"}`);
  doc.text(`Address: ${order.customer_address || "N/A"}`);
  doc.text(`City: ${order.customer_city}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();
}
