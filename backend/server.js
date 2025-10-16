import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";

// Staff Management Routes
import staffRoutes from "./Routes/staffRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import leaveRoutes from "./Routes/leaveRoutes.js";
import payrollRoutes from "./Routes/payrollRoutes.js";
import reportRoutes from "./Routes/reportRoutes.js";

//finance management

import budgetRoutes from './Routes/budgetRoutes.js';
import generalExpenseRoutes from './Routes/generalExpenseRoutes.js';
import advanceRoutes from "./Routes/advanceRoutes.js";
import salaryRoutes from './Routes/salaryRoutes.js';
import dashboardRoutes from './Routes/dashboardRoutes.js';

// Main System Routes
import userRouter from "./Routes/userRoutes.js";
import userDetailsRouter from "./Routes/userDetailsRoutes.js";
import routeRoutes from "./Routes/routeRoutes.js";
import vehicleRoutes from "./Routes/vehicalRoutes.js";
import contactRouter from "./Routes/contactRoutes.js";
import bookingRouter from "./Routes/bookingRoutes.js";
import router from "./Routes/paymentRoutes.js";
import adminRouter from "./Routes/adminRoutes.js";
import adminMahindaRoutes from "./Routes/adminMahindaRoutes.js";
import partRoutes from "./Routes/partRoutes.js";
import maintenanceRoutes from "./Routes/maintenanceRoutes.js";
import fuelRoutes from "./Routes/fuelRoutes.js";
import chatBotRoutes from "./Routes/chatBotRoutes.js";
import { startAutoCancellationScheduler } from "./utils/scheduler.js";

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

//finance management system
app.use('/api/budgets', budgetRoutes); 
app.use('/api/general-expenses', generalExpenseRoutes);
app.use('/api/advances', advanceRoutes); // For all advance CRUD operations
app.use('/api/salaries', salaryRoutes);
app.use('/api/dashboard', dashboardRoutes);
//app.use('/api/staff', staffRoutes);
// Main System API Routes
app.use("/api/auth", userRouter);
app.use("/api/user", userDetailsRouter);
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes); // Using vehicleRoutes from vehicalRoutes.js
app.use("/api/contacts", contactRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", router);
app.use("/api/admin", adminRouter);
app.use("/api/admin-mahinda", adminMahindaRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/chatbot", chatBotRoutes);

// Create default admin endpoint (for development)
app.post("/api/create-default-admin", async (req, res) => {
  try {
    const AdminMahinda = (await import("./models/adminMahinda.js")).default;
    
    // Check if admin already exists
    const existingAdmin = await AdminMahinda.findOne({ email: "adminmahinda@gmail.com" });
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Default admin already exists",
        admin: {
          _id: existingAdmin._id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
        },
      });
    }

    // Create default admin
    const admin = new AdminMahinda({
      email: "adminmahinda@gmail.com",
      password: "mahinda",
      name: "Admin Mahinda",
      role: "super_admin",
    });

    await admin.save();

    res.json({
      success: true,
      message: "Default admin created successfully",
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error creating default admin:", error);
    res.status(500).json({
      success: false,
      message: "Error creating default admin",
      error: error.message,
    });
  }
});

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
app.listen(port, () => {
  console.log(`🚀 Server started on PORT: ${port}`);
  
  // Start the auto-cancellation scheduler
  startAutoCancellationScheduler();
});
