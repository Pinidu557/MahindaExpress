import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    // Align with controller usage: field name is `vehicle`
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    vehicleNumber: { type: String, required: true }, // duplicate for easy search
    serviceType: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    mechanicId: { type: String },
    serviceCost: { type: Number },
    notes: String,
    mileageAtService: Number,
    nextServiceDate: Date,
    nextServiceMileage: Number,
    status: {
      type: String,
      enum: ["Available", "Under Maintenance"],
      default: "Under Maintenance",
    },
    // partsUsed stored as { part: ObjectId, qty: Number } in controller
    partsUsed: [
      {
        part: { type: mongoose.Schema.Types.ObjectId, ref: "Part" },
        qty: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
