import { Router } from "express";
import { authenticate, authenticateApiUser, checkUserRights } from "../middleware/authMiddleware";
import { createCityHandler, getAllCitiesHandler, getAllCitiesThirdPartyHandler, getSingleCityHandler, updateCityHandler } from "../controllers/cityController";

const router = Router();

router.get("/list", authenticateApiUser, getAllCitiesThirdPartyHandler); // Get All Cities --> Protected
router.get("/", authenticate, getAllCitiesHandler); // Get All Cities --> Protected
router.post("/", authenticate, createCityHandler); // Create City --> Protected
router.get("/:id", authenticate, getSingleCityHandler); // Single City --> Protected
router.put("/", authenticate, updateCityHandler); // Update City --> Protected

export default router;