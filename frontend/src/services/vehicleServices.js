import { vehiclesApi } from "../api/client.js";

// Get all vehicles
export const getAllVehicles = async () => {
  try {
    const response = await vehiclesApi.list();
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

// Get a single vehicle by ID
export const getVehicleById = async (id) => {
  try {
    const response = await vehiclesApi.get(id);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    throw error;
  }
};

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    const response = await vehiclesApi.create(vehicleData);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
};

// Update an existing vehicle
export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await vehiclesApi.update(id, vehicleData);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error updating vehicle with ID ${id}:`, error);
    throw error;
  }
};

// Delete a vehicle
export const deleteVehicle = async (id) => {
  try {
    const response = await vehiclesApi.remove(id);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    throw error;
  }
};
