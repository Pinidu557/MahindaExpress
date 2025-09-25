import Route from "../models/routes.js";

// Create a new route
export const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all routes
export const getAllRoutes = async (req, res) => {
  try {
    const { startLocation, endLocation, routeNumber, vehicalStatus } =
      req.query;

    //build filter objects dynamically
    let filter = {};

    if (startLocation)
      filter.startLocation = { $regex: startLocation, $options: "i" };
    if (endLocation)
      filter.endLocation = { $regex: endLocation, $options: "i" };
    if (routeNumber)
      filter.routeNumber = { $regex: routeNumber, $options: "i" };
    if (vehicalStatus) filter.vehicalStatus = vehicalStatus;

    const routes = await Route.find(filter);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single route by ID
export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a route
export const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a route
export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
