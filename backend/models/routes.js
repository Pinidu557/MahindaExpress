import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    startLocation: {
      type: String,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    stops: {
      type: [String],
      default: [],
    },
    distance: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: String,
      required: true,
    },
    schedule: {
      type: [
        {
          day: { type: String, required: true },
          departureTimes: { type: [String], required: true },
        },
      ],
      default: [],
    },
    assignedVehicleIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Vehicle",
      default: [],
    },
    vehicalStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    fare: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);
