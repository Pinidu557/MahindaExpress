import api from "./api";

// get all vehicles
export const getAllVehicles = () => api.get("/vehicles");

// get a specific vehicle by id
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);

// create a new vehicle
export const createVehicle = (vehicleData) =>
  api.post("/vehicles", vehicleData);

// update an existing vehicle by id
export const updateVehicle = (id, vehicleData) =>
  api.put(`/vehicles/${id}`, vehicleData);

// delete a vehicle by id
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// update vehicle status
export const updateVehicleStatus = (id, status) =>
  api.patch(`/vehicles/${id}/status`, { vehicleStatus: status });
