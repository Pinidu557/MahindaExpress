import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import connectDB from "./config/mongodb.js";
import routeRoutes from "./routes/routeRoutes.js";
import vehicleRoutes from "./routes/vehicalRoutes.js";
import cookieParser from "cookie-parser"; // For ES modules
import contactRouter from "./routes/contactRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

//API Endpoints
app.get("/", (req, res) => res.send("API Worrking ON Fire"));
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/contacts", contactRouter);
app.use("/api/bookings", bookingRouter);

app.listen(port, () => console.log(`server started on PORT:${port}`));
