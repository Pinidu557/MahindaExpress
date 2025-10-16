import { useState, useEffect } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { updateVehicle, createVehicle } from "../../services/vehicleServices";
import { getAllRoutes } from "../../services/routeService";
import { toast } from "react-toastify";

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

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false); // ✅ track overall validity
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

  // ✅ Validation logic
  const validate = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Plate Number is required.";
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.plateNumber)) {
      newErrors.plateNumber =
        "Plate Number must be letters, numbers, or dashes only.";
    } else if (formData.plateNumber.length < 3) {
      newErrors.plateNumber = "Plate Number must be at least 3 characters.";
    } else if (formData.plateNumber.length > 8) {
      newErrors.plateNumber = "Plate Number cannot exceed 8 characters.";
    }

    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = "Vehicle Type is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.vehicleType)) {
      newErrors.vehicleType =
        "Vehicle Type can only contain letters and spaces.";
    } else if (formData.vehicleType.trim().length < 2) {
      newErrors.vehicleType = "Vehicle Type must be at least 2 characters.";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required.";
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required.";
    } else if (Number(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be greater than 0.";
    } else if (Number(formData.capacity) > 100) {
      newErrors.capacity = "Capacity must be less than or equal to 100.";
    }

    if (!formData.mileage) {
      newErrors.mileage = "Mileage is required.";
    } else if (Number(formData.mileage) <= 0) {
      newErrors.mileage = "Mileage must be greater than 0.";
    }

    if (!formData.year) {
      newErrors.year = "Year is required.";
    } else if (
      Number(formData.year) < 1980 ||
      Number(formData.year) > currentYear
    ) {
      newErrors.year = `Year must be between 1980 and ${currentYear}.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ re-run validation whenever formData changes
  useEffect(() => {
    setIsValid(validate(false));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // stop if validation fails

    // Extra validation to ensure plateNumber is not null or empty
    if (!formData.plateNumber?.trim()) {
      setErrors({
        ...errors,
        plateNumber: "Plate Number cannot be empty.",
      });
      toast.error("Please enter a valid Plate Number");
      return;
    }

    try {
      // Convert plateNumber to lowercase to maintain consistency
      const payload = {
        ...formData,
        plateNumber: formData.plateNumber.trim(),
        vehicleType: formData.vehicleType.trim(),
        model: formData.model.trim(),
        capacity: Number(formData.capacity), // convert to number
        mileage: Number(formData.mileage),
        year: Number(formData.year),
        assignedRouteId: formData.assignedRouteId || null,
      };

      // Log the payload to debug
      console.log("Submitting vehicle data:", payload);

      if (existingData) {
        await updateVehicle(existingData._id, payload);
        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle(payload);
        toast.success("Vehicle added successfully");
      }

      onSuccess(); // refresh table
      onClose(); // close modal
    } catch (err) {
      console.error("Error saving vehicle:", err);

      // Mongo duplicate key error
      if (err.response?.data?.message?.includes("duplicate key")) {
        toast.error(
          "❌ Plate Number already exists. Please use a different one."
        );
      } else {
        toast.error("❌ Failed to save vehicle. Try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {/* Basic Details Section */}
      <div className="mb-4">
        <div className="mb-4">
          <InputField
            label="Plate Number"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
          />
          {errors.plateNumber && (
            <p className="text-red-500 text-xs">{errors.plateNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputField
              label="Vehicle Type"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              placeholder="e.g ,Bus, Van.."
            />
            {errors.vehicleType && (
              <p className="text-red-500 text-xs">{errors.vehicleType}</p>
            )}
          </div>
          <div>
            <InputField
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., TATA .."
            />
            {errors.model && (
              <p className="text-red-500 text-xs">{errors.model}</p>
            )}
          </div>
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <InputField
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
          />
          {errors.capacity && (
            <p className="text-red-500 text-xs">{errors.capacity}</p>
          )}
        </div>
        <div>
          <InputField
            label="Mileage (km)"
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={handleChange}
          />
          {errors.mileage && (
            <p className="text-red-500 text-xs">{errors.mileage}</p>
          )}
        </div>
      </div>

      {/* Status and Year Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <InputField
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
          />
          {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Vehicle Status
          </label>
          <select
            name="vehicleStatus"
            value={formData.vehicleStatus}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Available">Available</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Route Assignment Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-200 mb-1">
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
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <Button
          type="submit"
          disabled={!isValid}
          className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        >
          {existingData ? "Update Vehicle" : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}
