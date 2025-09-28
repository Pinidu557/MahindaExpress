import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";
import adminRoutes from "./routes/adminRoutes.js";
// Staff Management Routes
import staffRoutes from "./Routes/staffRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import leaveRoutes from "./Routes/leaveRoutes.js";
import payrollRoutes from "./Routes/payrollRoutes.js";
import reportRoutes from "./Routes/reportRoutes.js";

// Main System Routes
import userRouter from "./Routes/userRoutes.js";
import userDetailsRouter from "./Routes/userDetailsRoutes.js";
import routeRoutes from "./Routes/routeRoutes.js";
import vehicleRoutes from "./Routes/vehicalRoutes.js";
import contactRouter from "./Routes/contactRoutes.js";
import bookingRouter from "./Routes/bookingRoutes.js";
import router from "./Routes/paymentRoutes.js";
import adminRouter from "./Routes/adminRoutes.js";
import partRoutes from "./Routes/partRoutes.js";
import maintenanceRoutes from "./Routes/maintenanceRoutes.js";
import fuelRoutes from "./Routes/fuelRoutes.js";

dotenv.config(); // ✅ load .env variables

// Verify environment variables are loaded (without exposing sensitive data)
console.log("Environment variables loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  DB_CONNECTION: process.env.MONGO_URI ? "Set" : "Not Set",
  JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not Set",
  STRIPE_KEY: process.env.STRIPE_SECRET_KEY ? "Set" : "Not Set",
});

const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect DB
connectDB();

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        return callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Extra safety: set CORS headers explicitly (dev only)
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✅ API Endpoints
app.get("/", (req, res) => res.send("API Working ON Fire 🔥"));

// Staff Management API Routes
app.use("/staff", staffRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leave", leaveRoutes);
app.use("/payroll", payrollRoutes);
app.use("/reports", reportRoutes);

// Main System API Routes
app.use("/api/auth", userRouter);
app.use("/api/user", userDetailsRouter);
app.use("/api/routes", routeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes); // Using vehicleRoutes from vehicalRoutes.js
app.use("/api/contacts", contactRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", router);
app.use("/api/admin", adminRouter);
app.use("/api/parts", partRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);

// Add a test vehicle endpoint
app.get("/api/add-test-vehicle", async (req, res) => {
  try {
    const Vehicle = mongoose.model("Vehical");

    // Check if test vehicle already exists
    const existingVehicle = await Vehicle.findOne({ plateNumber: "tata" });
    if (existingVehicle) {
      return res.json({
        message: "Test vehicle 'tata' already exists",
        vehicle: existingVehicle,
      });
    }

    // Create test vehicle
    const vehicle = await Vehicle.create({
      plateNumber: "tata",
      vehicleType: "Bus",
      model: "Tata Marcopolo",
      capacity: 45,
      routeStatus: "Available",
    });

    res.json({
      message: "Test vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Error creating test vehicle:", error);
    res.status(500).json({
      message: "Error creating test vehicle",
      error: error.message,
    });
  }
});

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
