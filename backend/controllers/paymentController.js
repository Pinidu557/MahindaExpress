import multer from "multer";
import path from "path";
import fs from "fs";
import Booking from "../models/bookings.js";
import stripe from "../config/stripe.js"; // Import pre-configured Stripe instance

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/receipts";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only images and PDFs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files and PDFs are allowed!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const createPaymentIntent = async (req, res) => {
  const { amount, bookingId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: "lkr", // Change to your currency
      metadata: { bookingId },
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleBankTransfer = async (req, res) => {
  try {
    const {
      bookingId,
      transactionReference,
      payerName,
      paymentDate,
      totalAmount,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment receipt is required",
      });
    }

    // Validate required fields
    if (!bookingId || !transactionReference || !payerName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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

    // Update booking with bank transfer details
    booking.status = "pending_verification"; // Status for bank transfer payments
    booking.paymentMethod = "bank_transfer";
    booking.bankTransferDetails = {
      transactionReference,
      payerName,
      paymentDate: new Date(paymentDate),
      totalAmount: parseFloat(totalAmount),
      // Ensure the path is formatted correctly for URL access
      receiptPath: req.file.path.replace(/\\/g, "/"), // Convert Windows backslashes to forward slashes
      receiptFilename: req.file.filename,
      uploadedAt: new Date(),
    };

    console.log("Receipt saved with path:", req.file.path);

    await booking.save();

    res.json({
      success: true,
      message:
        "Payment receipt uploaded successfully. Your payment will be verified within 24 hours.",
      booking: booking,
    });
  } catch (error) {
    console.error("Bank transfer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bank transfer",
      error: error.message,
    });
  }
};
