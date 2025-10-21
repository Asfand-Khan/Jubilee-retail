import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import {
  listCommunicationLogs,
  repushCommunicationLog,
} from "../controllers/communicationController";

const router = Router();

router.post("/", authenticate, listCommunicationLogs); // Communication List Logs --> Protected
router.post("/repush", authenticate, repushCommunicationLog); // Comminication Log Repush --> Protected

export default router;