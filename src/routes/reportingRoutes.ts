import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getReportHandler } from "../controllers/reportingController";

const router = Router();

router.post("/", authenticate, getReportHandler); // Get report --> Protected

export default router;