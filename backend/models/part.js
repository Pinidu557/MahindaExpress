import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    partId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: String,
    supplier: String,
    cost: { type: Number, default: 0 },
    stockQty: { type: Number, default: 0 },
    minThreshold: { type: Number, default: 0 },
    location: String
  },
  { timestamps: true }
);

export default mongoose.model("Part", partSchema);
