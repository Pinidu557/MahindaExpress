import mongoose from "mongoose";
import dotenv from "dotenv";
import Staff from "./models/staffModel.js"; // adjust path if needed

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const fetchStaff = async () => {
  try {
    const staffData = await Staff.find({}, "name basicSalary").lean();
    console.log("Fetched staff data:", staffData);
  } catch (err) {
    console.error("❌ Error fetching staff:", err);
  } finally {
    mongoose.connection.close();
  }
};

const run = async () => {
  await connectDB();
  await fetchStaff();
};

run();
