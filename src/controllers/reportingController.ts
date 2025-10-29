import { Request, Response } from "express";
import { validateReport } from "../validations/reportValidations";
import { getReportWithDetails } from "../services/reportingService";
import ExcelJS from "exceljs";

// Module --> Report
// Method --> POST (Protected)
// Endpoint --> /api/v1/report
// Description --> Fetch report
export const getReportHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateReport.parse(req.body);
    const result = await getReportWithDetails(parsed);

    // Create workbook and worksheets
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Policy Report
    const policySheet = workbook.addWorksheet("Policy Report");

    // Define columns from your SELECT (exact header names)
    policySheet.columns = [
      { header: "POLICY_ID", key: "POLICY_ID" },
      { header: "PARTNER NAME", key: "PARTNER NAME" },
      { header: "POLICY NUMBER", key: "POLICY NUMBER" },
      { header: "POLICY STATUS", key: "POLICY STATUS" },
      { header: "POLICY ISSUE DATE", key: "POLICY ISSUE DATE" },
      { header: "POLICY START DATE", key: "POLICY START DATE" },
      { header: "POLICY EXPIRY DATE", key: "POLICY EXPIRY DATE" },
      { header: "TOTAL PRICE", key: "TOTAL PRICE" },
      { header: "DISCOUNT", key: "DISCOUNT" },
      { header: "COUPON NAME", key: "COUPON NAME" },
      { header: "CUSTOMER NAME", key: "CUSTOMER NAME" },
      { header: "CUSTOMER EMAIL", key: "CUSTOMER EMAIL" },
      { header: "CUSTOMER CONTACT", key: "CUSTOMER CONTACT" },
      { header: "CUSTOMER CNIC", key: "CUSTOMER CNIC" },
      { header: "CUSTOMER ADDRESS", key: "CUSTOMER ADDRESS" },
      { header: "DOCUMENT URL", key: "DOCUMENT URL" },
      { header: "PLAN NAME", key: "PLAN NAME" },
      { header: "PRODUCT NAME", key: "PRODUCT NAME" },
      { header: "AGENT NAME", key: "AGENT NAME" },
      { header: "AGENT CODE", key: "AGENT CODE" },
      { header: "BRANCH NAME", key: "BRANCH NAME" },
      { header: "BRANCH CODE", key: "BRANCH CODE" },
      { header: "BRANCH TAKAFUL CODE", key: "BRANCH TAKAFUL CODE" },
      { header: "CLIENT NAME", key: "CLIENT NAME" },
      { header: "CLIENT CODE", key: "CLIENT CODE" },
      { header: "DEVELOPMENT OFFICER NAME", key: "DEVELOPMENT OFFICER NAME" },
      { header: "DEVELOPMENT OFFICE CODE", key: "DEVELOPMENT OFFICE CODE" },
      { header: "TRACKING NUMBER", key: "TRACKING NUMBER" },
      { header: "ORDER ID", key: "ORDER ID" },
      { header: "PAYMENT MODE NAME", key: "PAYMENT MODE NAME" },
      { header: "TRANSACTION ID", key: "TRANSACTION ID" },
      { header: "APPROVAL CODE", key: "APPROVAL CODE" },
    ];

    // Add rows
    policySheet.addRows(result.policy);

    // Sheet 2: Policy Details
    const detailsSheet = workbook.addWorksheet("Policy Details");

    if (result.policy_details.length > 0) {
      // Use first row to infer columns dynamically
      const columns = Object.keys(result.policy_details[0]).map((key) => ({
        header: key.toUpperCase().replace(/_/g, " "),
        key,
      }));
      detailsSheet.columns = columns;
      detailsSheet.addRows(result.policy_details);
    } else {
      detailsSheet.addRow({ message: "No policy details found" });
    }

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Policy_Report.xlsx"
    );

    // Write to buffer and send
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
