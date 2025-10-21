import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { deleteCommonHandler, toggleStatusCommonHandler } from "../controllers/commonController";

const router = Router();
// 
router.delete("/", authenticate, deleteCommonHandler); // Delete Common --> Protected
router.put("/", authenticate, toggleStatusCommonHandler); // Status Update Common --> Protected

export default router;
