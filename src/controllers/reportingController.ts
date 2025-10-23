import { Request, Response } from "express";
import { validateReport } from "../validations/reportValidations";
import { getReport, getReportWithDetails } from "../services/reportingService";

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
    return res.status(200).json({
      status: 1,
      message: "Report fetched successfully",
      payload: [result],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};