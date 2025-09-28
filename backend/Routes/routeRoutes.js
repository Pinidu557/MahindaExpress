import express from "express";
const router = express.Router();
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} from "../controllers/routeControllers.js";

router.post("/", createRoute); // Create a new route
router.get("/", getAllRoutes); // Get all routes
router.get("/:id", getRouteById); // Get a single route by ID
router.put("/:id", updateRoute); // Update a route
router.delete("/:id", deleteRoute); // Delete a route

export default router;
