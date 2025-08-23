import express from "express";
const router = express.Router();
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
} from "../controllers/vehicalControllers.js";

router.post("/", createVehicle); // Create a new vehicle
router.get("/", getAllVehicles); // Get all vehicles
router.get("/:id", getVehicleById); // Get a single vehicle by ID
router.put("/:id", updateVehicle); // Update a vehicle
router.delete("/:id", deleteVehicle); // Delete a vehicle

router.patch("/:id/status", updateVehicleStatus); // Update vehicle status

export default router;
