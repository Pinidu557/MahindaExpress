import Booking from "../models/bookings.js";

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

  try {
    const newBooking = new Booking({
      routeId,
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

    // Find bookings with matching route and date
    const bookings = await Booking.find({
      routeId: routeId,
      journeyDate: { $gte: startDate, $lte: endDate },
      // Only consider confirmed (paid) bookings
      status: "paid", // Only mark seats as booked if payment is complete
    });

    // Extract all seat numbers from the bookings
    let bookedSeats = [];
    bookings.forEach((booking) => {
      bookedSeats = [...bookedSeats, ...booking.seats];
    });

    return res.status(200).json({
      success: true,
      bookedSeats: bookedSeats,
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

// Export all functions
export {
  createBooking,
  getBookedSeats,
  updateBooking,
  getBookingById,
  getUserBookings,
};
