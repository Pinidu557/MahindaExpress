import Booking from "../models/bookings.js";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";

// Get all bank transfers for admin review
export const getBankTransfers = async (req, res) => {
  try {
    const bankTransfers = await Booking.find({
      paymentMethod: "bank_transfer",
      bankTransferDetails: { $exists: true },
    })
      .populate("routeId", "startLocation endLocation")
      .sort({ createdAt: -1 });

    // Log receipt paths for debugging
    for (const transfer of bankTransfers) {
      if (
        transfer.bankTransferDetails &&
        transfer.bankTransferDetails.receiptPath
      ) {
        console.log(
          `Receipt path for booking ${transfer._id}: ${transfer.bankTransferDetails.receiptPath}`
        );
        // Check if file exists
        const filePath = path.join(
          process.cwd(),
          transfer.bankTransferDetails.receiptPath
        );
        const fileExists = fs.existsSync(filePath);
        console.log(`  File exists: ${fileExists}`);
      }
    }

    res.json({
      success: true,
      bankTransfers,
    });
  } catch (error) {
    console.error("Error fetching bank transfers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bank transfers",
      error: error.message,
    });
  }
};

// Approve bank transfer payment
export const approveBankTransfer = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentMethod !== "bank_transfer") {
      return res.status(400).json({
        success: false,
        message: "This booking is not a bank transfer payment",
      });
    }

    if (booking.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been approved",
      });
    }

    // Update booking status to paid
    booking.status = "paid";
    booking.bankTransferDetails.approvedAt = new Date();
    booking.bankTransferDetails.approvedBy = req.user?.id || "admin"; // If you have user auth

    await booking.save();

    res.json({
      success: true,
      message: "Bank transfer approved successfully",
      booking,
    });
  } catch (error) {
    console.error("Error approving bank transfer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve bank transfer",
      error: error.message,
    });
  }
};

// Reject bank transfer payment
export const rejectBankTransfer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    console.log(
      `Attempting to reject booking: ${bookingId} with reason: ${reason}`
    );

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log(`Booking not found: ${bookingId}`);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log(
      `Found booking: ${booking._id}, status: ${booking.status}, paymentMethod: ${booking.paymentMethod}`
    );

    if (booking.paymentMethod !== "bank_transfer") {
      return res.status(400).json({
        success: false,
        message: "This booking is not a bank transfer payment",
      });
    }

    // Update booking status to rejected
    booking.status = "rejected";

    // Ensure bankTransferDetails exists
    if (!booking.bankTransferDetails) {
      booking.bankTransferDetails = {};
    }

    booking.bankTransferDetails.rejectedAt = new Date();
    booking.bankTransferDetails.rejectedBy = req.user?.id || "admin";
    booking.bankTransferDetails.rejectionReason =
      reason || "Payment verification failed";

    console.log("Saving rejected booking with status:", booking.status);
    await booking.save();

    console.log("Successfully rejected booking:", booking._id);
    res.json({
      success: true,
      message: "Bank transfer rejected",
      booking,
    });
  } catch (error) {
    console.error("Error rejecting bank transfer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject bank transfer",
      error: error.message,
    });
  }
};

// Get all users (for user management)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get booking statistics for dashboard
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const paidBookings = await Booking.countDocuments({ status: "paid" });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const pendingVerification = await Booking.countDocuments({
      status: "pending_verification",
    });
    const rejectedBookings = await Booking.countDocuments({
      status: "rejected",
    });

    const totalRevenue = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalFare" } } },
    ]);

    const pendingRevenue = await Booking.aggregate([
      { $match: { status: "pending_verification" } },
      { $group: { _id: null, total: { $sum: "$totalFare" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        paidBookings,
        pendingBookings,
        pendingVerification,
        rejectedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error.message,
    });
  }
};
