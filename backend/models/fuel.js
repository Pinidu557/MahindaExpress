import mongoose from "mongoose";

const fuelSchema = new mongoose.Schema(
  {
    // Align with controller usage: field name is `vehicle`
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehical",
      required: true,
    },
    vehicleNumber: { type: String, required: true }, // vehicle plate
    liters: Number,
    costPerLiter: Number,
    totalCost: Number,
    odometer: Number,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Fuel", fuelSchema);
