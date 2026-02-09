import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import {
  listCommunicationLogs,
  repushCommunicationLog,
} from "../controllers/communicationController";

const router = Router();

router.post("/", authenticate, listCommunicationLogs); // Communication List Logs --> Protected
router.post("/repush", authenticate,checkUserRights(57,'can_edit'), repushCommunicationLog); // Comminication Log Repush --> Protected

export default router;