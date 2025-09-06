import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    vehicleStatus: {
      type: String,
      enum: ["Available", "unavailable", "Under Maintenance"],
      default: "Available",
    },
    assignedRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
