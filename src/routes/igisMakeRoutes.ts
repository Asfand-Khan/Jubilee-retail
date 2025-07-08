import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createIgisMakeHandler, getAllIgisMakesHandler, getSingleIgisMakeHandler, updateIgisMakeHandler } from "../controllers/igisMakeController";

const router = Router();

router.get("/", authenticate, getAllIgisMakesHandler); // Get All Igis Makes --> Protected
router.post("/", authenticate, createIgisMakeHandler); // Create Igis Make --> Protected
router.get("/:id", authenticate, getSingleIgisMakeHandler); // Single Igis Make --> Protected
router.put("/", authenticate, updateIgisMakeHandler); // Update Igis Make --> Protected

export default router;