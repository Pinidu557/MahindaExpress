import { useState, useEffect } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { updateVehicle, createVehicle } from "../../services/vehicleServices";
import { getAllRoutes } from "../../services/routeService";

export default function VehicleForm({ onSuccess, existingData, onClose }) {
  const [formData, setFormData] = useState(
    existingData || {
      plateNumber: "",
      vehicleType: "",
      model: "",
      capacity: "",
      mileage: "",
      year: "",
      vehicleStatus: "Available",
      assignedRouteId: "",
    }
  );

  const [routes, setRoutes] = useState([]);

  // Fetch available routes for dropdown
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await getAllRoutes();
        setRoutes(response.data);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // rem
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity), // convert to number
      };

      if (existingData) {
        await updateVehicle(existingData._id, payload);
      } else {
        await createVehicle(payload);
      }

      onSuccess(); // refresh table
      onClose(); // close modal
    } catch (err) {
      console.error("Error saving vehicle:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Plate Number"
        name="plateNumber"
        value={formData.plateNumber}
        onChange={handleChange}
      />
      <InputField
        label="Vehicle Type"
        name="vehicleType"
        value={formData.vehicleType}
        onChange={handleChange}
        placeholder="e.g ,Bus, Van.."
      />
      <InputField
        label="Model"
        name="model"
        value={formData.model}
        onChange={handleChange}
        placeholder="e.g., TATA .."
      />
      <InputField
        label="Capacity"
        name="capacity"
        type="number"
        value={formData.capacity}
        onChange={handleChange}
      />

      {/* ✅ New Mileage Field */}
      <InputField
        label="Mileage (km)"
        name="mileage"
        type="number"
        value={formData.mileage}
        onChange={handleChange}
      />
      {/* ✅ New Year Field */}
      <InputField
        label="Year"
        name="year"
        type="number"
        value={formData.year}
        onChange={handleChange}
      />
      <label className="block text-sm font-medium text-gray-200">
        Vehicle Status
      </label>
      <select
        name="vehicleStatus"
        value={formData.vehicleStatus}
        onChange={handleChange}
        className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="Available">Available</option>
        <option value="On Route">Unavailable</option>
        <option value="Under Maintenance">Under Maintenance</option>
      </select>

      {/* Assigned Route */}
      <label className="block text-sm font-medium text-gray-200">
        Assigned Route
      </label>
      <select
        name="assignedRouteId"
        value={formData.assignedRouteId}
        onChange={handleChange}
        className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Select Route --</option>
        {routes.map((route) => (
          <option key={route._id} value={route._id}>
            {route.routeNumber} - {route.startLocation} → {route.endLocation}
          </option>
        ))}
      </select>

      <Button type="submit">
        {existingData ? "Update Vehicle" : "Add Vehicle"}
      </Button>
    </form>
  );
}
