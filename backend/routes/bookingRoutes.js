import express from "express";
import {
  createBooking,
  getBookedSeats,
  updateBooking,
  getBookingById,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// Add the new route for getting booked seats
bookingRouter.get("/booked-seats", getBookedSeats);
bookingRouter.post("/checkout", createBooking);
bookingRouter.put("/:bookingId", updateBooking); // Fixed to match frontend URL pattern
bookingRouter.get("/:bookingId", getBookingById);

export default bookingRouter;
