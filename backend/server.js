import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Log requests

// MongoDB connection
connectDB();

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Bus Management Backend is running...");
});

// Import routes
import routeRoutes from "./routes/routeRoutes.js";
import vehicleRoutes from "./routes/vehicalRoutes.js";

// Use routes
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
