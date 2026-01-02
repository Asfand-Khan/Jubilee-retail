import { Router } from "express";
import {
  authenticate,
  authenticateApiUser,
} from "../middleware/authMiddleware";
import {
  getMISReportHandler,
  getMISReportJSONHandler,
  getReportHandler,
} from "../controllers/reportingController";

const router = Router();

router.post("/", authenticate, getReportHandler); // Get report --> Protected
router.post("/mis-internal", authenticate, getMISReportHandler); // Get MIS report --> Protected - EXCEL
router.post("/mis-external", authenticateApiUser, getMISReportHandler); // Get MIS report --> Protected - EXCEL
router.post("/mis-json", authenticate, getMISReportJSONHandler); // Get MIS report --> Protected

export default router;
