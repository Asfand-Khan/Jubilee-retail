import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import {
  createAgentHandler,
  getAllAgentsHandler,
  getSingleAgentHandler,
  updateAgentHandler,
} from "../controllers/agentController";

const router = Router();

router.post("/all", authenticate,getAllAgentsHandler); // Get All Agents --> Protected
router.post("/", authenticate,checkUserRights(7,'can_create'), createAgentHandler); // Create Agents --> Protected
router.get("/:id", authenticate, getSingleAgentHandler); // Single Agents --> Protected
router.put("/", authenticate,checkUserRights(7,'can_edit'), updateAgentHandler); // Update Agents --> Protected

export default router;