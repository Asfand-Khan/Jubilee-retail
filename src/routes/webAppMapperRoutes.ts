import { Router } from "express";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";
import {
  createWebAppMapperHandler,
  getAllWebAppMappersHandler,
  getSingleWebAppMapperHandler,
  updateWebAppMapperHandler,
} from "../controllers/webAppMapperController";

const router = Router();

router.get("/", authenticate, getAllWebAppMappersHandler); // Get All WebAppMapper --> Protected
router.post("/", authenticate,checkUserRights(40,'can_create'), createWebAppMapperHandler); // Create WebAppMapper --> Protected
router.post("/single", authenticate, getSingleWebAppMapperHandler); // Single WebAppMapper --> Protected
router.put("/", authenticate,checkUserRights(40,'can_edit'), updateWebAppMapperHandler); // Update WebAppMapper --> Protected

export default router;