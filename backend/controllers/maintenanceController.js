import mongoose from "mongoose";
import Maintenance from "../models/maintenance.js";
import Vehicle from "../models/vehicle.js";
import Part from "../models/part.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/**
 * Helper: resolve vehicle by vehicleId OR vehicleNumber
 * Returns { vehicleDoc, vehicleNumber }
 */
const resolveVehicle = async ({ vehicleId, vehicleNumber }) => {
  let v = null;
  if (vehicleId) {
    v = await Vehicle.findById(vehicleId);
    if (!v) throw new Error(`Vehicle with ID ${vehicleId} not found`);
  }
  if (!v && vehicleNumber) {
    v = await Vehicle.findOne({ vehicleNumber });
    if (!v) throw new Error(`Vehicle with number '${vehicleNumber}' not found`);
  }
  if (!v) throw new Error("No vehicle specified or found");
  return { vehicleDoc: v, vehicleNumber: v.vehicleNumber };
};

// CREATE with auto-deduct parts (without transaction)
export const createMaintenance = asyncHandler(async (req, res) => {
  try {
    console.log("Received maintenance data:", req.body); // Debug log
    const {
      vehicleId,
      vehicleNumber,
      serviceType,
      serviceDate,
      mechanicId,
      serviceCost,
      notes,
      mileageAtService,
      nextServiceDate,
      nextServiceMileage,
      status,
      partsUsed // [{ part: <partId OR _id>, qty }]
    } = req.body;

    // Validate required fields
    if (!vehicleNumber && !vehicleId) {
      throw new Error("Either vehicleNumber or vehicleId is required");
    }
    if (!serviceType) {
      throw new Error("serviceType is required");
    }
    if (!serviceDate) {
      throw new Error("serviceDate is required");
    }

    const { vehicleDoc, vehicleNumber: vNum } = await resolveVehicle({ vehicleId, vehicleNumber });

    // Normalize partsUsed to ObjectIds and check stock
    let normalizedParts = [];
    if (Array.isArray(partsUsed) && partsUsed.length) {
      console.log("Processing parts:", partsUsed); // Debug log
      for (const item of partsUsed) {
        console.log(`Looking for part: ${item.part}, qty: ${item.qty}`); // Debug log
        const partDoc =
          await Part.findById(item.part) ||
          await Part.findOne({ partId: item.part });
        if (!partDoc) {
          console.log(`Part not found: ${item.part}`); // Debug log
          throw new Error(`Part not found: ${item.part}`);
        }
        console.log(`Found part: ${partDoc.name}, stock: ${partDoc.stockQty}, needed: ${item.qty}`); // Debug log
        if (partDoc.stockQty < item.qty) {
          throw new Error(`Insufficient stock for ${partDoc.name}. In stock: ${partDoc.stockQty}, needed: ${item.qty}`);
        }
        normalizedParts.push({ part: partDoc._id, qty: item.qty });
      }
      // Deduct stock
      for (const n of normalizedParts) {
        await Part.findByIdAndUpdate(
          n.part,
          { $inc: { stockQty: -n.qty } },
          { new: true }
        );
      }
    }

    const record = await Maintenance.create({
      vehicle: vehicleDoc._id,
      vehicleNumber: vNum,
      serviceType,
      serviceDate: new Date(serviceDate),
      mechanicId,
      serviceCost,
      notes,
      mileageAtService,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
      nextServiceMileage,
      status: status || "pending",
      partsUsed: normalizedParts
    });

    res.status(201).json(record);
  } catch (e) {
    console.error("Maintenance creation error:", e.message); // Debug log
    res.status(400).json({ message: e.message });
  }
});

// READ with filters
export const listMaintenance = asyncHandler(async (req, res) => {
  const { vehicleNumber, vehicleId, serviceType, status, startDate, endDate } = req.query;
  const q = {};
  if (vehicleNumber) q.vehicleNumber = vehicleNumber;
  if (vehicleId) q.vehicle = vehicleId;
  if (serviceType) q.serviceType = serviceType;
  if (status) q.status = status;
  if (startDate && endDate) q.serviceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const records = await Maintenance.find(q)
    .populate("vehicle", "vehicleNumber model")
    .populate("partsUsed.part", "partId name")
    .sort({ serviceDate: -1, createdAt: -1 });

  res.json(records);
});

// UPDATE (change status, notes, cost, next service, reassign staff)
// NOTE: This does NOT adjust parts stock on update to keep logic simple.
// If you need stock adjustments on edit, implement diff logic similarly to create.
export const updateMaintenance = asyncHandler(async (req, res) => {
  const rec = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate("vehicle", "vehicleNumber model")
    .populate("partsUsed.part", "partId name");
  if (!rec) return res.status(404).json({ message: "Maintenance not found" });
  res.json(rec);
});

// DELETE with optional stock rollback of partsUsed
export const deleteMaintenance = asyncHandler(async (req, res) => {
  try {
    const rec = await Maintenance.findById(req.params.id);
    if (!rec) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    // Roll back parts stock
    if (rec.partsUsed?.length) {
      for (const item of rec.partsUsed) {
        await Part.findByIdAndUpdate(
          item.part,
          { $inc: { stockQty: item.qty } }
        );
      }
    }

    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Maintenance deleted and stock restored" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// REPORTS: totals, frequency, trends (basic)
export const maintenanceReport = asyncHandler(async (req, res) => {
  const { vehicleNumber, startDate, endDate, serviceType } = req.query;
  const match = {};
  if (vehicleNumber) match.vehicleNumber = vehicleNumber;
  if (serviceType) match.serviceType = serviceType;
  if (startDate && endDate) match.serviceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const [agg] = await Maintenance.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$serviceType",
        count: { $sum: 1 },
        totalCost: { $sum: "$serviceCost" }
      }
    },
    { $sort: { totalCost: -1 } }
  ]);

  const total = await Maintenance.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        records: { $sum: 1 },
        totalCost: { $sum: "$serviceCost" }
      }
    }
  ]);

  res.json({
    summary: total[0] || { records: 0, totalCost: 0 },
    byServiceType: agg ? [agg] : []
  });
});

// REMINDERS: due within X days or Y km (defaults 7 days / 500 km)
export const maintenanceReminders = asyncHandler(async (req, res) => {
  const days = Number(req.query.days ?? 7);
  const km = Number(req.query.km ?? 500);
  const now = new Date();
  const soon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const dueByDate = await Maintenance.find({
    nextServiceDate: { $ne: null, $lte: soon }
  }).select("vehicleNumber serviceType serviceDate nextServiceDate status");

  const dueByMileage = await Maintenance.find({
    nextServiceMileage: { $ne: null },
    // NOTE: comparing to current vehicle mileage requires vehicle doc.
  })
    .populate("vehicle", "mileage vehicleNumber")
    .select("vehicle vehicleNumber serviceType mileageAtService nextServiceMileage");

  const dueMileage = dueByMileage.filter((r) => {
    const current = r.vehicle?.mileage ?? 0;
    return r.nextServiceMileage - current <= km;
  });

  res.json({
    config: { daysWindow: days, kmWindow: km },
    dueByDate,
    dueByMileage: dueMileage
  });
});
