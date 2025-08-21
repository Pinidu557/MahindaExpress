const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Log requests

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Bus Management Backend is running...");
});

// Import routes
const routeRoutes = require("./routes/routeRoutes");
const vehicleRoutes = require("./routes/vehicalRoutes");

// Use routes
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
