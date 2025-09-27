import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import staffRoutes from "./Routes/staffRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import leaveRoutes from "./Routes/leaveRoutes.js";
import payrollRoutes from "./Routes/payrollRoutes.js";
import reportRoutes from "./Routes/reportRoutes.js";

dotenv.config(); // ✅ load .env variables

const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect DB
connectDB();

// ✅ CORS: for development, reflect the requesting origin

app.use(express.json());
app.use(cookieParser());
const corsMiddleware = cors({ origin: true, credentials: true });
app.use(corsMiddleware);

// Extra safety: set CORS headers explicitly (dev only)
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✅ API Endpoints
app.get("/", (req, res) => res.send("API Working ON Fire 🔥"));
app.use("/staff", staffRoutes); // ✅ mount under /staff
app.use("/attendance", attendanceRoutes);
app.use("/leave", leaveRoutes);
app.use("/payroll", payrollRoutes);
app.use("/reports", reportRoutes);

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
