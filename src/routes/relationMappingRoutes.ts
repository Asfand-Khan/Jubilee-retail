import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createRelationMappingHandler, getAllRelationMappingsHandler, getSingleRelationMappingHandler, updateRelationMappingHandler } from "../controllers/relationMappingController";

const router = Router();

router.get("/", authenticate, getAllRelationMappingsHandler); // Get All RelationMapping --> Protected
router.post("/", authenticate, createRelationMappingHandler); // Create RelationMapping --> Protected
router.post("/single", authenticate, getSingleRelationMappingHandler); // Single RelationMapping --> Protected
router.put("/", authenticate, updateRelationMappingHandler); // Update RelationMapping --> Protected

export default router;