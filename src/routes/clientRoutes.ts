import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import {
  createClientHandler,
  getAllClientsHandler,
  getSingleClientHandler,
  updateClientHandler,
} from "../controllers/clientController";

const router = Router();

router.post("/all", authenticate, getAllClientsHandler); // Get All Clients --> Protected
router.post("/", authenticate, createClientHandler); // Create Clients --> Protected
router.get("/:id", authenticate, getSingleClientHandler); // Single Clients --> Protected
router.put("/", authenticate, updateClientHandler); // Update Clients --> Protected

export default router;