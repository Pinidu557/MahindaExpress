import Booking from "../models/bookings.js";
import Route from "../models/routes.js";
import mongoose from "mongoose";

const createBooking = async (req, res) => {
  const {
    routeId,
    userId,
    passengerName,
    mobileNumber,
    email,
    seats,
    boardingPoint,
    dropoffPoint,
    gender,
    journeyDate,
    totalFare,
    status,
  } = req.body;

  // Basic validation
  if (
    !passengerName ||
    !mobileNumber ||
    !seats ||
    !seats.length ||
    !boardingPoint ||
    !dropoffPoint ||
    !gender ||
    !journeyDate ||
    !totalFare
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  // Validate passenger name (letters and spaces only)
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(passengerName)) {
    return res.status(400).json({
      success: false,
      message: "Passenger name should contain only letters",
    });
  }

  // Validate mobile number (digits only, proper length)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(mobileNumber)) {
    return res.status(400).json({
      success: false,
      message: "Mobile number should be 10 digits",
    });
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }
  }

  try {
    // Fetch route data to get route number and create route name
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(400).json({
        success: false,
        message: "Route not found",
      });
    }

    // Create route name from start and end locations (Colombo-Ampara format)
    const routeName = `${route.startLocation}-${route.endLocation}`;

    const newBooking = new Booking({
      routeId,
      routeNumber: route.routeNumber,
      routeName: routeName,
      userId,
      passengerName,
      mobileNumber,
      email,
      seats,
      boardingPoint,
      dropoffPoint,
      gender,
      journeyDate: new Date(journeyDate),
      totalFare,
      status: status || "pending",
    });

    await newBooking.save();
    res.status(201).json({
      success: true,
      message: "Booking successful!",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this new function to get booked seats
const getBookedSeats = async (req, res) => {
  try {
    const { routeId, journeyDate } = req.query;

    console.log("Received routeId:", routeId, "type:", typeof routeId);
    console.log("Received journeyDate:", journeyDate);

    if (!routeId || !journeyDate) {
      return res.status(400).json({
        success: false,
        message: "Route ID and journey date are required",
      });
    }

    // Create date range for the given journey date
    const startDate = new Date(journeyDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(journeyDate);
    endDate.setHours(23, 59, 59, 999);

    // Handle routeId - could be numeric or ObjectId
    let routeObjectId;
    
    // Check if routeId is a valid ObjectId format (24 hex characters)
    if (mongoose.Types.ObjectId.isValid(routeId)) {
      routeObjectId = new mongoose.Types.ObjectId(routeId);
    } else {
      // If it's a numeric ID, we need to find the route by routeNumber
      try {
        const route = await Route.findOne({ routeNumber: routeId.toString() });
        if (!route) {
          return res.status(404).json({
            success: false,
            message: "Route not found",
          });
        }
        routeObjectId = route._id;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid route ID",
        });
      }
    }

    // Find paid bookings
    const paidBookings = await Booking.find({
      routeId: routeObjectId,
      journeyDate: { $gte: startDate, $lte: endDate },
      status: "paid",
    });

    // Find pending bookings
    const pendingBookings = await Booking.find({
      routeId: routeObjectId,
      journeyDate: { $gte: startDate, $lte: endDate },
      status: "pending",
    });

    // Find pending verification bookings
    const pendingVerificationBookings = await Booking.find({
      routeId: routeObjectId,
      journeyDate: { $gte: startDate, $lte: endDate },
      status: "pending_verification",
    });

    // Extract all seat numbers from paid bookings
    let bookedSeats = [];
    paidBookings.forEach((booking) => {
      bookedSeats = [...bookedSeats, ...booking.seats];
    });

    // Extract all seat numbers from pending bookings
    let pendingSeats = [];
    pendingBookings.forEach((booking) => {
      pendingSeats = [...pendingSeats, ...booking.seats];
    });

    // Extract all seat numbers from pending verification bookings
    let pendingVerificationSeats = [];
    pendingVerificationBookings.forEach((booking) => {
      pendingVerificationSeats = [...pendingVerificationSeats, ...booking.seats];
    });

    return res.status(200).json({
      success: true,
      bookedSeats: bookedSeats,
      pendingSeats: pendingSeats,
      pendingVerificationSeats: pendingVerificationSeats,
    });
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booked seats",
      error: error.message,
    });
  }
};

// Update booking details
const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updateData = req.body;

    // Find booking by ID and update with new data
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

// Update the getUserBookings function
const getUserBookings = async (req, res) => {
  try {
    // Get the user ID from the authenticated user or from the URL parameter
    const userId = req.userId || req.params.userId;

    console.log("Attempting to fetch bookings for user ID:", userId);
    console.log("Request user ID from token:", req.userId);
    console.log("Request params:", req.params);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required or userId not provided",
      });
    }

    // Find all bookings for this user, sort by newest first
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    // If no bookings are found, check if there are any bookings with matching email
    if (bookings.length === 0 && req.user && req.user.email) {
      console.log(
        `No bookings found with userId, checking email: ${req.user.email}`
      );
      const emailBookings = await Booking.find({ email: req.user.email }).sort({
        createdAt: -1,
      });
      if (emailBookings.length > 0) {
        console.log(
          `Found ${emailBookings.length} bookings with matching email`
        );
        return res.status(200).json({
          success: true,
          bookings: emailBookings,
        });
      }
    }

    console.log(`Found ${bookings.length} bookings for user ${userId}`);

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// Get all bookings (for admin/user management)
const getAllBookings = async (req, res) => {
  try {
    // Find all bookings regardless of status, sort by newest first
    const bookings = await Booking.find().sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} total bookings`);

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all bookings",
      error: error.message,
    });
  }
};

// Cancel booking with refund details
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundDetails, reason } = req.body;

    console.log("Cancel booking request:", {
      bookingId,
      refundDetails,
      reason,
    });
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    if (!refundDetails || !reason) {
      return res.status(400).json({
        success: false,
        message: "Refund details and cancellation reason are required",
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking can be cancelled (within 1 hour)
    const bookingTime = new Date(booking.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - bookingTime;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (timeDifference >= oneHour) {
      return res.status(400).json({
        success: false,
        message: "Booking can only be cancelled within 1 hour of booking",
      });
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      reason: reason,
      refundDetails: {
        bankName: refundDetails.bankName,
        accountNumber: refundDetails.accountNumber,
        accountHolderName: refundDetails.accountHolderName,
      },
      refundStatus: "pending",
      refundProcessedAt: null,
    };

    await booking.save();

    // Log the cancellation for admin review
    console.log(`Booking ${bookingId} cancelled by user. Refund details:`, {
      bankName: refundDetails.bankName,
      accountNumber: refundDetails.accountNumber,
      accountHolderName: refundDetails.accountHolderName,
      reason: reason,
    });

    return res.json({
      success: true,
      message:
        "Booking cancelled successfully. Refund will be processed within 3-5 business days.",
      booking: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

// Update refund status
const updateRefundStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundStatus, processedAt, processedBy } = req.body;

    console.log("Update refund status request:", {
      bookingId,
      refundStatus,
      processedAt,
      processedBy,
    });

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    if (!refundStatus) {
      return res.status(400).json({
        success: false,
        message: "Refund status is required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.cancellationDetails) {
      return res.status(400).json({
        success: false,
        message: "This booking has not been cancelled",
      });
    }

    // Update refund status
    booking.cancellationDetails.refundStatus = refundStatus;
    if (processedAt) {
      booking.cancellationDetails.refundProcessedAt = new Date(processedAt);
    }
    if (processedBy) {
      booking.cancellationDetails.refundProcessedBy = processedBy;
    }

    await booking.save();

    console.log(
      `Refund status updated for booking ${bookingId}: ${refundStatus}`
    );

    return res.json({
      success: true,
      message: `Refund status updated to ${refundStatus}`,
      booking: booking,
    });
  } catch (error) {
    console.error("Error updating refund status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update refund status",
      error: error.message,
    });
  }
};

// Auto-cancel pending bookings after 1 hour
const autoCancelPendingBookings = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    // Find all pending bookings older than 1 hour
    const expiredBookings = await Booking.find({
      status: "pending",
      createdAt: { $lte: oneHourAgo }
    });

    if (expiredBookings.length > 0) {
      console.log(`Found ${expiredBookings.length} expired pending bookings to cancel`);
      
      // Update all expired bookings to cancelled status
      const updateResult = await Booking.updateMany(
        {
          status: "pending",
          createdAt: { $lte: oneHourAgo }
        },
        {
          $set: {
            status: "cancelled",
            cancellationDetails: {
              cancelledAt: new Date(),
              reason: "Auto-cancelled due to payment timeout (1 hour)",
              refundDetails: {
                bankName: null,
                accountNumber: null,
                accountHolderName: null,
              },
              refundStatus: "pending",
              refundProcessedAt: null,
            }
          }
        }
      );

      console.log(`Auto-cancelled ${updateResult.modifiedCount} expired pending bookings`);
      return { success: true, cancelledCount: updateResult.modifiedCount };
    }
    
    return { success: true, cancelledCount: 0 };
  } catch (error) {
    console.error("Error auto-cancelling pending bookings:", error);
    return { success: false, error: error.message };
  }
};

// Manual endpoint to trigger auto-cancellation (for testing)
const triggerAutoCancellation = async (req, res) => {
  try {
    const result = await autoCancelPendingBookings();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Auto-cancellation completed. ${result.cancelledCount} bookings cancelled.`,
        cancelledCount: result.cancelledCount
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Auto-cancellation failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error triggering auto-cancellation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger auto-cancellation",
      error: error.message
    });
  }
};

// Export all functions
export {
  createBooking,
  getBookedSeats,
  updateBooking,
  getBookingById,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  updateRefundStatus,
  autoCancelPendingBookings,
  triggerAutoCancellation,
};
