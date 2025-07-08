import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createIgisSubMakeHandler, getAllIgisSubMakesHandler, getSingleIgisSubMakeHandler, updateIgisSubMakeHandler } from "../controllers/igisSubMakeController";

const router = Router();

router.get("/", authenticate, getAllIgisSubMakesHandler); // Get All Igis Sub Makes --> Protected
router.post("/", authenticate, createIgisSubMakeHandler); // Create Igis Sub Make --> Protected
router.get("/:id", authenticate, getSingleIgisSubMakeHandler); // Single Sub Igis Make --> Protected
router.put("/", authenticate, updateIgisSubMakeHandler); // Update Igis Sub Make --> Protected

export default router;