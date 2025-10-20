import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { deleteCommonHandler } from "../controllers/commonController";

const router = Router();
// authenticate,
router.delete("/",  deleteCommonHandler); // Delete Common --> Protected

export default router;
