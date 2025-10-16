import mongoose from "mongoose";
import Maintenance from "../models/maintenance.js";
import Part from "../models/part.js";
import Vehicle from "../models/vehicals.js"; // Import the Vehicle model
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
    // Clean up the vehicle number by removing any leading/trailing spaces
    const cleanVehicleNumber = vehicleNumber.trim();
    console.log(
      `Searching for vehicle with plateNumber: "${cleanVehicleNumber}"`
    );

    // First, try to find by plateNumber
    v = await Vehicle.findOne({ plateNumber: cleanVehicleNumber });

    if (!v) {
      console.log(`No vehicle found with plateNumber: "${cleanVehicleNumber}"`);

      // If not found, create a temporary vehicle with this plate number
      console.log(
        `Creating a new vehicle with plateNumber: "${cleanVehicleNumber}"`
      );
      try {
        v = await Vehicle.create({
          plateNumber: cleanVehicleNumber,
          vehicleType: "Bus",
          model: "Auto-created from Maintenance",
          capacity: 40,
          routeStatus: "Available",
        });
        console.log(`Created new vehicle: ${v.plateNumber}, ${v._id}`);
      } catch (err) {
        console.error("Error creating vehicle:", err);
        throw new Error(
          `Vehicle with number '${cleanVehicleNumber}' not found and could not be created automatically. Error: ${err.message}`
        );
      }
    } else {
      console.log(`Found vehicle: ${v.plateNumber}, ${v.model}`);
    }
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
      partsUsed, // [{ part: <partId OR _id>, qty }]
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

    const { vehicleDoc, vehicleNumber: vNum } = await resolveVehicle({
      vehicleId,
      vehicleNumber,
    });

    // Normalize partsUsed to ObjectIds and check stock
    let normalizedParts = [];
    if (Array.isArray(partsUsed) && partsUsed.length) {
      console.log("Processing parts:", partsUsed); // Debug log
      for (const item of partsUsed) {
        console.log(`Looking for part: ${item.part}, qty: ${item.qty}`); // Debug log
        const partDoc =
          (await Part.findById(item.part)) ||
          (await Part.findOne({ partId: item.part }));
        if (!partDoc) {
          console.log(`Part not found: ${item.part}`); // Debug log
          throw new Error(`Part not found: ${item.part}`);
        }
        console.log(
          `Found part: ${partDoc.name}, stock: ${partDoc.stockQty}, needed: ${item.qty}`
        ); // Debug log
        if (partDoc.stockQty < item.qty) {
          throw new Error(
            `Insufficient stock for ${partDoc.name}. In stock: ${partDoc.stockQty}, needed: ${item.qty}`
          );
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

    // Make sure vehicleNumber is correctly set - strip any leading/trailing whitespace
    const cleanVehicleNumber = vehicleDoc.plateNumber.trim();
    console.log(
      "Creating maintenance record with vehicleNumber:",
      cleanVehicleNumber
    );

    if (!cleanVehicleNumber) {
      throw new Error("Vehicle number is required");
    }

    const record = await Maintenance.create({
      vehicle: vehicleDoc._id,
      vehicleNumber: cleanVehicleNumber, // Use the cleaned plateNumber from the vehicle
      serviceType,
      serviceDate: new Date(serviceDate),
      mechanicId,
      serviceCost,
      notes,
      mileageAtService,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
      nextServiceMileage,
      status: status || "Under Maintenance",
      partsUsed: normalizedParts,
    });

    // Update vehicle status based on maintenance status
    const vehicleStatus = status || "Under Maintenance";
    await Vehicle.findByIdAndUpdate(vehicleDoc._id, {
      vehicleStatus: vehicleStatus
    });
    
    console.log(`Updated vehicle ${cleanVehicleNumber} status to ${vehicleStatus}`);

    res.status(201).json(record);
  } catch (e) {
    console.error("Maintenance creation error:", e.message); // Debug log
    res.status(400).json({ message: e.message });
  }
});

// READ with filters
export const listMaintenance = asyncHandler(async (req, res) => {
  try {
    const { vehicleNumber, vehicleId, serviceType, status, startDate, endDate } =
      req.query;
    const q = {};
    if (vehicleNumber) q.vehicleNumber = vehicleNumber;
    if (vehicleId) q.vehicle = vehicleId;
    if (serviceType) q.serviceType = serviceType;
    if (status) q.status = status;
    if (startDate && endDate)
      q.serviceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const records = await Maintenance.find(q)
      .populate("vehicle", "plateNumber model vehicleType mileage")
      .populate("partsUsed.part", "name stockQty")
      .sort({ serviceDate: -1, createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error in listMaintenance:", error);
    res.status(500).json({ message: "Failed to fetch maintenance records", error: error.message });
  }
});

// UPDATE (change status, notes, cost, next service, reassign staff)
// NOTE: This does NOT adjust parts stock on update to keep logic simple.
// If you need stock adjustments on edit, implement diff logic similarly to create.
export const updateMaintenance = asyncHandler(async (req, res) => {
  try {
    const rec = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("vehicle", "plateNumber model vehicleType")
      .populate("partsUsed.part", "name stockQty");
    
    if (!rec) return res.status(404).json({ message: "Maintenance not found" });

    // Update vehicle status based on maintenance status
    if (req.body.status && rec.vehicle && rec.vehicle._id) {
      const vehicleStatus = req.body.status; // "Available" or "Under Maintenance"
      
      console.log(`[MAINTENANCE UPDATE] Changing vehicle ${rec.vehicle.plateNumber} (${rec.vehicle._id}) from current status to: ${vehicleStatus}`);
      
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        rec.vehicle._id, 
        { vehicleStatus: vehicleStatus },
        { new: true }
      );
      
      if (updatedVehicle) {
        console.log(`✅ [SUCCESS] Vehicle ${rec.vehicle.plateNumber} status updated to: ${updatedVehicle.vehicleStatus}`);
      } else {
        console.error(`❌ [ERROR] Failed to update vehicle ${rec.vehicle._id}`);
      }
    }

    res.json(rec);
  } catch (error) {
    console.error("Error updating maintenance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update maintenance",
      error: error.message
    });
  }
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
        await Part.findByIdAndUpdate(item.part, {
          $inc: { stockQty: item.qty },
        });
      }
    }

    // Update vehicle status back to "Available" when maintenance is deleted
    await Vehicle.findByIdAndUpdate(rec.vehicle, {
      vehicleStatus: "Available"
    });
    console.log(`Updated vehicle status to Available after deleting maintenance`);

    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Maintenance deleted, stock restored, and vehicle status updated" });
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
  if (startDate && endDate)
    match.serviceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const byServiceType = await Maintenance.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$serviceType",
        count: { $sum: 1 },
        totalCost: { $sum: "$serviceCost" },
      },
    },
    { $sort: { totalCost: -1 } },
  ]);

  const total = await Maintenance.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        records: { $sum: 1 },
        totalCost: { $sum: "$serviceCost" },
      },
    },
  ]);

  res.json({
    summary: total[0] || { records: 0, totalCost: 0 },
    byServiceType: byServiceType || [],
  });
});

// REMINDERS: due within X days or Y km (defaults 7 days / 500 km)
export const maintenanceReminders = asyncHandler(async (req, res) => {
  try {
    const days = Number(req.query.days ?? 7);
    const km = Number(req.query.km ?? 500);
    const now = new Date();
    const soon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const dueByDate = await Maintenance.find({
      nextServiceDate: { $ne: null, $lte: soon },
    }).select("vehicleNumber serviceType serviceDate nextServiceDate status");

    const dueByMileage = await Maintenance.find({
      nextServiceMileage: { $ne: null },
      // NOTE: comparing to current vehicle mileage requires vehicle doc.
    })
      .populate("vehicle", "mileage plateNumber vehicleType")
      .select(
        "vehicle vehicleNumber serviceType mileageAtService nextServiceMileage"
      );

    const dueMileage = dueByMileage.filter((r) => {
      const current = r.vehicle?.mileage ?? 0;
      return r.nextServiceMileage - current <= km;
    });

    res.json({
      config: { daysWindow: days, kmWindow: km },
      dueByDate,
      dueByMileage: dueMileage,
    });
  } catch (error) {
    console.error("Error in maintenanceReminders:", error);
    res.status(500).json({ message: "Failed to fetch maintenance reminders", error: error.message });
  }
});
