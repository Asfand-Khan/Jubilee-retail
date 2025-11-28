import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getMISReportHandler, getReportHandler } from "../controllers/reportingController";

const router = Router();

router.post("/", authenticate, getReportHandler); // Get report --> Protected
router.post("/mis", authenticate, getMISReportHandler); // Get MIS report --> Protected

export default router;