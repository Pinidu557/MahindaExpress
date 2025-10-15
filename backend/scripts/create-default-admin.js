import mongoose from "mongoose";
import AdminMahinda from "../models/adminMahinda.js";
import dotenv from "dotenv";

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await AdminMahinda.findOne({ email: "adminmahinda@gmail.com" });
    
    if (existingAdmin) {
      console.log("Default admin already exists:");
      console.log({
        _id: existingAdmin._id,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role,
      });
      return;
    }

    // Create default admin
    const admin = new AdminMahinda({
      email: "adminmahinda@gmail.com",
      password: "mahinda",
      name: "Admin Mahinda",
      role: "super_admin",
    });

    await admin.save();

    console.log("Default admin created successfully:");
    console.log({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

  } catch (error) {
    console.error("Error creating default admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createDefaultAdmin();
