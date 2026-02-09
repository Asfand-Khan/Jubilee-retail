import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createMenuHandler, getAllMenusHandler, getSingleMenuHandler, updateMenuHandler, updateMenuSortingHandler } from "../controllers/menuController";
const router = Router();

// authenticate,
router.get("/", authenticate, getAllMenusHandler); // Get All Menus --> Protected
router.get("/:id", getSingleMenuHandler);
router.post("/", authenticate, createMenuHandler);
router.put("/:id", authenticate, updateMenuHandler);
router.post("/sort", authenticate, updateMenuSortingHandler);

export default router;