import mongoose from "mongoose";
import Vehicle from "../models/vehicle.js";

const connectDB = async () => {
  mongoose.connection.on("connected", () =>
    console.log("MongoDB connected successfully")
  );
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err?.message || err);
  });

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    // Fix legacy indexes if any (e.g., old `plateNumber` index)
    try {
      const indexes = await Vehicle.collection.indexes();
      const hasOld = indexes.some((i) => i.name === "plateNumber_1");
      if (hasOld) {
        await Vehicle.collection.dropIndex("plateNumber_1");
      }
      await Vehicle.collection.createIndex({ vehicleNumber: 1 }, { unique: true });
    } catch (idxErr) {
      console.warn("Vehicle index check/create warning:", idxErr?.message || idxErr);
    }
  } catch (err) {
    console.error("Initial MongoDB connection failed:", err?.message || err);
    // Continue startup; Mongoose will keep trying to reconnect in background
  }
};

export default connectDB;