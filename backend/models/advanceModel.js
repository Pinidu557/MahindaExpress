import mongoose from "mongoose";

const advanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    staffName: { // Added for easier table display without deep populate
      type: String,
      required: true,
    },
    basicSalarySnapshot: { // Snapshot of basic salary at time of request
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: ["Medical Emergency", "Utility Bill Payment", "Vehicle Repair/Transport", "Family Event", "Other"],
      required: true,
    },
    deductionMonth: {
      type: String, // Format YYYY-MM
      required: true,
    },
    processedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Deducted", "Cancelled"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Advance", advanceSchema);