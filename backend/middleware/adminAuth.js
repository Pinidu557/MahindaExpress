import jwt from "jsonwebtoken";
import AdminMahinda from "../models/adminMahinda.js";
import { asyncHandler } from "./asyncHandler.js";

export const adminAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

      // Get admin from token
      req.admin = await AdminMahinda.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, admin not found",
        });
      }

      // Check if admin is active
      if (!req.admin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, admin account is deactivated",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
});
