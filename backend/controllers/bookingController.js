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
      // Only consider active bookings
      status: { $nin: ["cancelled"] },
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

// Export both functions
export { createBooking, getBookedSeats };
