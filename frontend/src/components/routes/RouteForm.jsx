import { useState, useEffect } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { createRoute, updateRoute } from "../../services/routeService";
import { toast } from "react-toastify";

export default function RouteForm({ onSuccess, existingData, onClose }) {
  const [formData, setFormData] = useState(
    existingData ?? {
      routeNumber: "",
      startLocation: "",
      endLocation: "",
      distance: "",
      estimatedTime: "",
      fare: "",
      vehicalStatus: "Active",
      stops: [],
    }
  );

  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    // Start Location validation
    if (!formData.startLocation.trim()) {
      newErrors.startLocation = "Start Location is required.";
    } else if (!/^[A-Za-z\s,]+$/.test(formData.startLocation)) {
      newErrors.startLocation = "Only letters, spaces, and commas allowed.";
    }

    // End Location validation
    if (!formData.endLocation.trim()) {
      newErrors.endLocation = "End Location is required.";
    } else if (!/^[A-Za-z\s,]+$/.test(formData.endLocation)) {
      newErrors.endLocation = "Only letters, spaces, and commas allowed.";
    }

    // Same location check
    if (
      formData.startLocation.trim() &&
      formData.endLocation.trim() &&
      formData.startLocation.trim().toLowerCase() ===
        formData.endLocation.trim().toLowerCase()
    ) {
      newErrors.endLocation =
        "End Location cannot be the same as Start Location.";
    }

    // ✅ Distance validation
    if (!formData.distance) {
      newErrors.distance = "Distance is required.";
    } else if (isNaN(formData.distance)) {
      newErrors.distance = "Distance must be a number.";
    } else if (Number(formData.distance) <= 0) {
      newErrors.distance = "Distance must be greater than 0.";
    } else if (Number(formData.distance) >= 1000) {
      newErrors.distance = "Distance must be less than 1000 km.";
    }

    // ✅ Estimated Time validation
    if (!formData.hours && !formData.minutes) {
      newErrors.estimatedTime = "Estimated Time is required.";
    }

    // ✅ Fare validation
    if (formData.fare === "" || formData.fare === null) {
      newErrors.fare = "Fare is required.";
    } else if (isNaN(formData.fare)) {
      newErrors.fare = "Fare must be a number.";
    } else if (Number(formData.fare) < 0) {
      newErrors.fare = "Fare cannot be negative.";
    } else if (Number(formData.fare) > 5000) {
      newErrors.fare = "Fare must be less than 5000.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  // ✅ re-run validation whenever formData changes
  useEffect(() => {
    setIsValid(validate(false));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔴 Call validation before saving
    if (!validate()) {
      //toast.error("Please fix the errors before submitting.");
      return;
    }

    const hours = formData.hours ? `${formData.hours}h` : "";
    const minutes = formData.minutes ? `${formData.minutes}m` : "";
    const estimatedTime = `${hours} ${minutes}`.trim();

    try {
      // Convert numeric fields
      const payload = {
        ...formData,
        distance: Number(formData.distance),
        fare: Number(formData.fare),
        estimatedTime,
      };

      if (existingData) {
        // 🔒 prevent removing routeNumber during update
        if (!formData.routeNumber.trim()) {
          toast.error("Route Number is required and cannot be empty.");
          return;
        }
        await updateRoute(existingData._id, payload);
      } else {
        await createRoute(payload);
      }
      toast.success("Route saved successfully ✅");

      onSuccess(); // refresh table
      onClose(); // close modal
    } catch (err) {
      console.error("Error saving route:", err);

      // Mongo duplicate key error (routeNumber unique violation)
      if (err.response?.data?.message?.includes("duplicate key")) {
        toast.error(
          "❌ Route number already exists. Please use a different one."
        );
      } else {
        toast.error("❌ Failed to save route. Try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Route Number"
        name="routeNumber"
        value={formData.routeNumber}
        onChange={handleChange}
      />
      <div>
        <InputField
          label="Start Location"
          name="startLocation"
          value={formData.startLocation}
          onChange={handleChange}
        />
        {errors.startLocation && (
          <p className="text-red-500 text-sm">{errors.startLocation}</p>
        )}
      </div>
      <div>
        <InputField
          label="End Location"
          name="endLocation"
          value={formData.endLocation}
          onChange={handleChange}
        />
        {errors.endLocation && (
          <p className="text-red-500 text-sm">{errors.endLocation}</p>
        )}
      </div>
      <div>
        <InputField
          label="Distance (km)"
          name="distance"
          type="number"
          value={formData.distance}
          onChange={handleChange}
        />
        {errors.distance && (
          <p className="text-red-500 text-sm">{errors.distance}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200">
          Estimated Time
        </label>
        <div className="flex space-x-2">
          {/* Hours dropdown */}
          <select
            name="hours"
            value={formData.hours || ""}
            onChange={handleChange}
            className="p-2 rounded-md bg-slate-800 border border-slate-600 text-white"
          >
            <option value="">Hours</option>
            {[...Array(25).keys()].map((h) => (
              <option key={h} value={h}>
                {h}h
              </option>
            ))}
          </select>

          {/* Minutes dropdown */}
          <select
            name="minutes"
            value={formData.minutes || ""}
            onChange={handleChange}
            className="p-2 rounded-md bg-slate-800 border border-slate-600 text-white"
          >
            <option value="">Minutes</option>
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                {m}m
              </option>
            ))}
          </select>
        </div>
        {errors.estimatedTime && (
          <p className="text-red-500 text-sm">{errors.estimatedTime}</p>
        )}
      </div>

      <div>
        <InputField
          label="Fare"
          name="fare"
          type="number"
          value={formData.fare}
          onChange={handleChange}
        />
        {errors.fare && <p className="text-red-500 text-sm">{errors.fare}</p>}
      </div>

      <Button type="submit" disabled={!isValid}>
        {existingData ? "Update Route" : "Add Route"}
      </Button>
    </form>
  );
}
