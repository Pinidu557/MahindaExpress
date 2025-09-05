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
    journeyDate,
    totalFare,
    status,
  } = req.body;

  // Basic validation
  if (
    !routeId ||
    !passengerName ||
    !mobileNumber ||
    !email ||
    !seats ||
    !boardingPoint ||
    !dropoffPoint ||
    !journeyDate ||
    !totalFare
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const newBooking = new Booking({
      routeId: routeId,
      userId: userId,
      passengerName: passengerName,
      mobileNumber: mobileNumber,
      email: email,
      seats: seats,
      boardingPoint: boardingPoint,
      dropoffPoint: dropoffPoint,
      journeyDate: journeyDate,
      totalFare: totalFare,
      status: status,
    });

    await newBooking.save();
    res.status(201).json({
      success: true,
      message: "Booking successful!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default createBooking;
