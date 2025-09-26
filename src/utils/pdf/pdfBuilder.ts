import PDFDocument from "pdfkit";
import { Response } from "express";

export function createPDF(res: Response, filename: string) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${filename}.pdf`);

  const doc = new PDFDocument({ size: "A4", margin: 20 });
  doc.pipe(res);

  return doc;
}