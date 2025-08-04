import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createWebAppMapperHandler,
  getAllWebAppMappersHandler,
  getSingleWebAppMapperHandler,
  updateWebAppMapperHandler,
} from "../controllers/webAppMapperController";

const router = Router();

router.get("/", authenticate, getAllWebAppMappersHandler); // Get All WebAppMapper --> Protected
router.post("/", authenticate, createWebAppMapperHandler); // Create WebAppMapper --> Protected
router.post("/single", authenticate, getSingleWebAppMapperHandler); // Single WebAppMapper --> Protected
router.put("/", authenticate, updateWebAppMapperHandler); // Update WebAppMapper --> Protected

export default router;