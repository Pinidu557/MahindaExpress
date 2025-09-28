import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const bookingSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    passengerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    seats: {
      type: [Number],
      required: true,
    },
    boardingPoint: {
      type: String,
      required: true,
    },
    dropoffPoint: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    journeyDate: {
      type: Date,
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "cancelled",
        "pending_verification",
        "rejected",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer"],
      default: "card",
    },
    bankTransferDetails: {
      transactionReference: String,
      payerName: String,
      paymentDate: Date,
      totalAmount: Number,
      receiptPath: String,
      receiptFilename: String,
      uploadedAt: Date,
      approvedAt: Date,
      approvedBy: String,
      rejectedAt: Date,
      rejectedBy: String,
      rejectionReason: String,
    },
    cancellationDetails: {
      cancelledAt: Date,
      reason: String,
      refundDetails: {
        bankName: String,
        accountNumber: String,
        accountHolderName: String,
      },
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: "pending",
      },
      refundProcessedAt: Date,
      refundProcessedBy: String,
      refundReference: String,
    },
  },
  { timestamps: true }
);

bookingSchema.plugin(AutoIncrement, {
  inc_field: "_id",
  start_seq: 1001,
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
