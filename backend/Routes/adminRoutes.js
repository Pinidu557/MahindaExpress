import express from "express";
import {
  getBankTransfers,
  approveBankTransfer,
  rejectBankTransfer,
  getUsers,
  getBookingStats,
} from "../controllers/adminController.js";

const router = express.Router();

// Bank transfer management routes
router.get("/bank-transfers", getBankTransfers);
router.put("/approve-bank-transfer/:bookingId", approveBankTransfer);
router.put("/reject-bank-transfer/:bookingId", rejectBankTransfer);

// User management routes
router.get("/users", getUsers);

// Dashboard statistics
router.get("/stats", getBookingStats);

export default router;
