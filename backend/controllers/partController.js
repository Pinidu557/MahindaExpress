import Part from "../models/part.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const createPart = asyncHandler(async (req, res) => {
  const p = await Part.create(req.body);
  res.status(201).json(p);
});

export const listParts = asyncHandler(async (req, res) => {
  const { category, supplier, stock } = req.query;
  const q = {};
  if (category) q.category = category;
  if (supplier) q.supplier = supplier;
  if (stock === "low") q.$expr = { $lte: ["$stockQty", "$minThreshold"] };
  if (stock === "out") q.stockQty = { $lte: 0 };
  const parts = await Part.find(q).sort({ name: 1 });
  res.json(parts);
});

export const getPart = asyncHandler(async (req, res) => {
  const p = await Part.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Part not found" });
  res.json(p);
});

export const updatePart = asyncHandler(async (req, res) => {
  const p = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ message: "Part not found" });
  res.json(p);
});

export const deletePart = asyncHandler(async (req, res) => {
  const p = await Part.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Part not found" });
  res.json({ message: "Part deleted" });
});

// Reports: usage trends & restocking alerts (basic)
export const inventoryReport = asyncHandler(async (req, res) => {
  const lowStock = await Part.find({ $expr: { $lte: ["$stockQty", "$minThreshold"] } });
  const outOfStock = await Part.find({ stockQty: { $lte: 0 } });
  res.json({
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    lowStock,
    outOfStock
  });
});
