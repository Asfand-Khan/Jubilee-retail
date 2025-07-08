import { Router } from "express";
import {
  deleteUserProfile,
  getMyProfile,
  getUserProfile,
  getUserProfiles,
  loginUser,
  registerUser,
  sendOtp,
  updateUser,
  verifyOtp,
} from "../controllers/userController";
import { authenticate, checkUserRights } from "../middleware/authMiddleware";

const router = Router();

// router.post("/register", authenticate, checkUserRights(1,'canCreate'), registerUser);

router.post("/login", loginUser); // Login User
router.post("/send-otp", sendOtp); // Send OTP
router.post("/verify-otp", verifyOtp); // Verify OTP
router.post("/register", authenticate, registerUser); // Register User --> Protected

router.get("/", authenticate, getUserProfiles); // Get All Users --> Protected
router.put("/", authenticate, updateUser); // Update User --> Protected
router.get("/my-profile", authenticate, getMyProfile); // Get Logged In User Profile --> Protected
router.get("/:id", authenticate, getUserProfile); // Get Single User --> Protected
router.delete("/:id", authenticate, deleteUserProfile); // Delete User --> Protected

export default router;