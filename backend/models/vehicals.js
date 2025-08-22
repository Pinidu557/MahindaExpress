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
    routeStatus: {
      type: String,
      enum: ["Available", "On Route", "Under Maintenance"],
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
