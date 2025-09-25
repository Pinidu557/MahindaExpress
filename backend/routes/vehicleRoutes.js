import express from "express";
import {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle
} from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/", createVehicle);
router.get("/", listVehicles);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
