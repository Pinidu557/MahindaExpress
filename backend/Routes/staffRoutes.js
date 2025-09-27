import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  assignBus,
  markAttendance,
  addOvertime,
  checkIn,
  checkOut,
  generateReport,
} from "../controllers/staffController.js";

const router = express.Router();

// GET routes
router.get("/", getAllStaff);
router.get("/report/all", generateReport);
router.get("/:id", getStaffById);

// POST routes
router.post("/", createStaff);

// PUT routes
router.put("/:id", updateStaff);
router.put("/assign/:id", assignBus);
router.put("/attendance/:id", markAttendance);
router.put("/overtime/:id", addOvertime);
router.put("/checkin/:id", checkIn);
router.put("/checkout/:id", checkOut);

// DELETE routes
router.delete("/:id", deleteStaff);

export default router;
