import Vehicle from "../models/vehicle.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const createVehicle = asyncHandler(async (req, res) => {
  try {
    const v = await Vehicle.create(req.body);
    res.status(201).json(v);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Vehicle number already exists" });
    }
    throw err;
  }
});

export const listVehicles = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.vehicleNumber) q.vehicleNumber = req.query.vehicleNumber;
  const list = await Vehicle.find(q).sort({ createdAt: -1 });
  res.json(list);
});

export const getVehicle = asyncHandler(async (req, res) => {
  const v = await Vehicle.findById(req.params.id);
  if (!v) return res.status(404).json({ message: "Vehicle not found" });
  res.json(v);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!v) return res.status(404).json({ message: "Vehicle not found" });
  res.json(v);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const v = await Vehicle.findByIdAndDelete(req.params.id);
  if (!v) return res.status(404).json({ message: "Vehicle not found" });
  res.json({ message: "Vehicle deleted" });
});
