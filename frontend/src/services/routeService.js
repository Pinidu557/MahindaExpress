import api from "./api";

// get all routes
export const getAllRoutes = () => api.get("/routes");

// get a specific route by id
export const getRouteById = (id) => api.get(`/routes/${id}`);

// create a new route
export const createRoute = (routeData) => api.post("/routes", routeData);

// update an existing route by id
export const updateRoute = (id, routeData) =>
  api.put(`/routes/${id}`, routeData);

// delete a route by id
export const deleteRoute = (id) => api.delete(`/routes/${id}`);
