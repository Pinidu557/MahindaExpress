import express from "express";
import {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  logoutAdmin,
  createDefaultAdmin,
} from "../controllers/adminMahindaController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const adminMahindaRouter = express.Router();

// Public routes
adminMahindaRouter.post("/login", loginAdmin);
adminMahindaRouter.post("/create-default", createDefaultAdmin); // Remove this in production

// Protected routes (require authentication)
adminMahindaRouter.get("/profile", adminAuth, getAdminProfile);
adminMahindaRouter.put("/profile", adminAuth, updateAdminProfile);
adminMahindaRouter.put("/change-password", adminAuth, changePassword);
adminMahindaRouter.post("/logout", adminAuth, logoutAdmin);

export default adminMahindaRouter;
