// add-test-vehicle.js
import mongoose from "mongoose";
import Vehicle from "../models/vehicals.js";

async function addTestVehicle() {
  try {
    await mongoose.connect("mongodb://localhost:27017/MahindaExpress");
    console.log("Connected to MongoDB");

    const testVehicle = await Vehicle.create({
      plateNumber: "TEST123",
      vehicleType: "Bus",
      model: "Test Bus",
      capacity: 40,
      routeStatus: "Available",
    });

    console.log("Created test vehicle:", testVehicle);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

addTestVehicle();
