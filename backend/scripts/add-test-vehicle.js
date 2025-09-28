import mongoose from "mongoose";
import dotenv from "dotenv/config";
import connectDB from "../config/mongodb.js";
import Vehicle from "../models/vehicals.js";

const addTestVehicle = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ plateNumber: "tata" });
    if (existingVehicle) {
      console.log("Test vehicle 'tata' already exists");
      process.exit(0);
    }

    // Create test vehicle
    const vehicle = await Vehicle.create({
      plateNumber: "tata",
      vehicleType: "Bus",
      model: "Tata Marcopolo",
      capacity: 45,
      routeStatus: "Available",
    });

    console.log("Test vehicle created:", vehicle);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

addTestVehicle();
