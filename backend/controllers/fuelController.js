import Fuel from "../models/fuel.js";
import Vehicle from "../models/vehicle.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const resolveVehicle = async ({ vehicleId, vehicleNumber }) => {
  let v = null;
  if (vehicleId) v = await Vehicle.findById(vehicleId);
  if (!v && vehicleNumber) v = await Vehicle.findOne({ vehicleNumber });
  if (!v) throw new Error("Vehicle not found");
  return { vehicleDoc: v, vehicleNumber: v.vehicleNumber };
};

// CREATE
export const createFuel = asyncHandler(async (req, res) => {
  const { vehicleId, vehicleNumber, liters, costPerLiter, totalCost, odometer, date } = req.body;
  const { vehicleDoc, vehicleNumber: vNum } = await resolveVehicle({ vehicleId, vehicleNumber });

  const rec = await Fuel.create({
    vehicle: vehicleDoc._id,
    vehicleNumber: vNum,
    liters,
    costPerLiter,
    totalCost,
    odometer,
    date
  });

  // (Optional) update vehicle mileage if odometer is higher
  if (typeof odometer === "number" && odometer > (vehicleDoc.mileage ?? 0)) {
    vehicleDoc.mileage = odometer;
    await vehicleDoc.save();
  }

  res.status(201).json(rec);
});

// READ + filters
export const listFuel = asyncHandler(async (req, res) => {
  const { vehicleNumber, startDate, endDate } = req.query;
  const q = {};
  if (vehicleNumber) q.vehicleNumber = vehicleNumber;
  if (startDate && endDate) q.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const list = await Fuel.find(q).populate("vehicle", "vehicleNumber model").sort({ date: -1 });
  res.json(list);
});

// UPDATE / DELETE
export const updateFuel = asyncHandler(async (req, res) => {
  const rec = await Fuel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!rec) return res.status(404).json({ message: "Fuel record not found" });
  res.json(rec);
});

export const deleteFuel = asyncHandler(async (req, res) => {
  const rec = await Fuel.findByIdAndDelete(req.params.id);
  if (!rec) return res.status(404).json({ message: "Fuel record not found" });
  res.json({ message: "Fuel record deleted" });
});

// REPORTS: km/l & monthly fuel costs (basic)
export const fuelReport = asyncHandler(async (req, res) => {
  const { vehicleNumber, startDate, endDate } = req.query;
  const match = {};
  if (vehicleNumber) match.vehicleNumber = vehicleNumber;
  if (startDate && endDate) match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const data = await Fuel.find(match).sort({ date: 1 });

  // naive efficiency: (delta km) / (liters sum)
  let km = 0, liters = 0;
  for (let i = 1; i < data.length; i++) {
    const diff = (data[i].odometer ?? 0) - (data[i - 1].odometer ?? 0);
    if (diff > 0) km += diff;
  }
  liters = data.reduce((s, r) => s + (r.liters ?? 0), 0);
  const kmPerL = liters > 0 ? +(km / liters).toFixed(2) : 0;

  // monthly spend
  const byMonth = {};
  for (const r of data) {
    const key = new Date(r.date).toISOString().slice(0, 7); // YYYY-MM
    byMonth[key] = (byMonth[key] || 0) + (r.totalCost ?? 0);
  }

  res.json({ records: data.length, km, liters, kmPerL, monthlyCosts: byMonth });
});
