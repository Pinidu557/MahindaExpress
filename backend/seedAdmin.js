import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/adminModel.js";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

// Connect to MongoDB using env variable
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const createAdmin = async () => {
  const email = "adminmahinda@gmail.com"; // choose your admin email
  const password = "mahinda"; // choose your admin password

  const existing = await Admin.findOne({ email });
  if (existing) return console.log("Admin already exists");

  const hashedPassword = bcrypt.hashSync(password, 10); // hash password
  await Admin.create({ email, password: hashedPassword });
  console.log(`Admin created: ${email} / ${password}`);
};

createAdmin();
