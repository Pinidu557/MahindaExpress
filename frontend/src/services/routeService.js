import { api } from "../api/client.js";

// Get all routes
export const getAllRoutes = async () => {
  try {
    const response = await api.get("/routes");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};

// Get a single route by ID
export const getRouteById = async (id) => {
  try {
    const response = await api.get(`/routes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching route with ID ${id}:`, error);
    throw error;
  }
};

// Create a new route
export const createRoute = async (routeData) => {
  try {
    const response = await api.post("/routes", routeData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating route:", error);
    throw error;
  }
};

// Update an existing route
export const updateRoute = async (id, routeData) => {
  try {
    const response = await api.put(`/routes/${id}`, routeData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error updating route with ID ${id}:`, error);
    throw error;
  }
};

// Delete a route
export const deleteRoute = async (id) => {
  try {
    const response = await api.delete(`/routes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error deleting route with ID ${id}:`, error);
    throw error;
  }
};
