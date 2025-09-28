import express from "express";
import {
  createBooking,
  getBookedSeats,
  updateBooking,
  getBookingById,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  updateRefundStatus,
} from "../controllers/bookingController.js";
import userAuth from "../middleware/userAuth.js";

const bookingRouter = express.Router();

// IMPORTANT: Route order matters! The more specific routes should come first
// Add the new route for getting booked seats
bookingRouter.get("/booked-seats", getBookedSeats);

// Add route for getting all bookings (for admin)
bookingRouter.get("/all", getAllBookings); // Access via /api/bookings/all

// Add route for getting user bookings with authentication - must come BEFORE /:bookingId
bookingRouter.get("/user", userAuth, getUserBookings); // Access via /api/bookings/user
bookingRouter.get("/user/:userId", userAuth, getUserBookings); // Access via /api/bookings/user/:userId

// General routes
bookingRouter.post("/checkout", createBooking);
bookingRouter.put("/:bookingId", updateBooking);
bookingRouter.get("/:bookingId", getBookingById);
bookingRouter.post("/:bookingId/cancel", userAuth, cancelBooking);
bookingRouter.put("/:bookingId/refund", userAuth, updateRefundStatus);

export default bookingRouter;
