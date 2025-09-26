import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true }, // plate
    model: String,
    year: Number,
    mileage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
