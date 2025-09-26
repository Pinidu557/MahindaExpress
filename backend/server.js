import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import userDetailsRouter from "./Routes/userDetailsRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import vehicleRoutes from "./routes/vehicalRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import router from "./routes/paymentRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import partRoutes from "./routes/partRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//API Endpoints
app.get("/", (req, res) => res.send("API Worrking ON Fire"));
app.use("/api/auth", userRouter);
app.use("/api/user", userDetailsRouter);
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/contacts", contactRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", router);
app.use("/api/admin", adminRouter);
app.use("/api/parts", partRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);

app.listen(port, () => console.log(`server started on PORT:${port}`));
