import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import { createCityHandler, getAllCitiesHandler, getSingleCityHandler, updateCityHandler } from "../controllers/cityController";

const router = Router();

router.get("/", authenticate, getAllCitiesHandler); // Get All Cities --> Protected
router.post("/", authenticate, createCityHandler); // Create City --> Protected
router.get("/:id", authenticate, getSingleCityHandler); // Single City --> Protected
router.put("/", authenticate, updateCityHandler); // Update City --> Protected

export default router;