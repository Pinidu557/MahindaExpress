import express from "express";
import {
  createMaintenance,
  listMaintenance,
  updateMaintenance,
  deleteMaintenance,
  maintenanceReport,
  maintenanceReminders
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/", createMaintenance);
router.get("/", listMaintenance);
router.get("/report", maintenanceReport);
router.get("/reminders", maintenanceReminders);
router.put("/:id", updateMaintenance);
router.delete("/:id", deleteMaintenance);

export default router;
