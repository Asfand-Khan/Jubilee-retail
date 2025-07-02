import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { getAllMenusHandler } from "../controllers/menuController";
const router = Router();

// authenticate,
router.get("/", authenticate, getAllMenusHandler); // Get All Menus --> Protected

export default router;