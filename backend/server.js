import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import userDetailsRouter from "./Routes/userDetailsRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import vehicleRoutes from "./routes/vehicalRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import router from "./routes/paymentRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import partRoutes from "./routes/partRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
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

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//API Endpoints
app.get("/", (req, res) => res.send("API Worrking ON Fire"));
app.use("/api/auth", userRouter);
app.use("/api/user", userDetailsRouter);
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes); // Note: Using vehicleRoutes from vehicalRoutes.js
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

app.listen(port, () => console.log(`server started on PORT:${port}`));
