import express from "express";
import {
  createBooking,
  getBookedSeats,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// Add the new route for getting booked seats
bookingRouter.get("/booked-seats", getBookedSeats);
bookingRouter.post("/checkout", createBooking);

export default bookingRouter;
