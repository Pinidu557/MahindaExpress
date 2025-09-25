import { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { createRoute, updateRoute } from "../../services/routeService";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert numeric fields
      const payload = {
        ...formData,
        distance: Number(formData.distance),
        fare: Number(formData.fare),
      };

      if (existingData) {
        await updateRoute(existingData._id, payload);
      } else {
        await createRoute(payload);
      }

      onSuccess(); // refresh table
      onClose(); // close modal
    } catch (err) {
      console.error("Error saving route:", err);
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
      <InputField
        label="Start Location"
        name="startLocation"
        value={formData.startLocation}
        onChange={handleChange}
      />
      <InputField
        label="End Location"
        name="endLocation"
        value={formData.endLocation}
        onChange={handleChange}
      />
      <InputField
        label="Distance (km)"
        name="distance"
        type="number"
        value={formData.distance}
        onChange={handleChange}
      />
      <InputField
        label="Estimated Time"
        name="estimatedTime"
        value={formData.estimatedTime}
        onChange={handleChange}
        placeholder="e.g. 2h 30m"
      />
      <InputField
        label="Fare"
        name="fare"
        type="number"
        value={formData.fare}
        onChange={handleChange}
      />
      {/* Use select for Vehicle Status */}
      <label className="block">
        Vehicle Status
        <select
          name="vehicalStatus"
          value={formData.vehicalStatus}
          onChange={handleChange}
          className="mt-1 block w-full rounded border p-2"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </label>
      <Button type="submit">
        {existingData ? "Update Route" : "Add Route"}
      </Button>
    </form>
  );
}
