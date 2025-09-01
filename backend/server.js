import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import userRouter from "./Routes/userRoutes.js";
import userDetailsRouter from "./Routes/userDetailsRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import vehicleRoutes from "./routes/vehicalRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

//API Endpoints
app.get("/", (req, res) => res.send("API Worrking ON Fire"));
app.use("/api/auth", userRouter);
app.use("/api/user", userDetailsRouter);
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.listen(port, () => console.log(`server started on PORT:${port}`));
