import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api.js";

export default function CreateStaffForm({ onCreated }) {
  const navigate = useNavigate();
  const { staffId } = useParams(); // when editing, route: /staff/edit/:staffId

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Driver",
    assignedBus: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // used while fetching staff for edit

  // Check backend connection on mount
  useEffect(() => {
    let cancelled = false;
    const checkConnection = async () => {
      try {
        await api.get("/staff");
        // Connection successful
      } catch (err) {
        if (!cancelled) {
          setError(
            "Could not connect to the server. Please check if the backend is running."
          );
        }
      }
    };
    checkConnection();
    return () => {
      cancelled = true;
    };
  }, []);

  // If editing, fetch staff details and populate the form
  useEffect(() => {
    if (!staffId) return;
    let cancelled = false;

    const fetchStaff = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/staff/${staffId}`);
        // Handle API that might return { staff: {...} } or {...}
        const staffData = res.data?.staff ?? res.data;
        if (!cancelled && staffData) {
          setForm({
            name: staffData.name ?? "",
            email: staffData.email ?? "",
            phone: staffData.phone ?? "",
            role: staffData.role ?? "Driver",
            assignedBus: staffData.assignedBus ?? "",
          });
          setErrors({});
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Failed to load staff details. " +
              (err.response?.data?.message || err.message || "")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStaff();
    return () => {
      cancelled = true;
    };
  }, [staffId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneClean = form.phone.replace(/\s/g, "");
      if (!/^\+?[1-9]\d{0,15}$/.test(phoneClean)) {
        newErrors.phone =
          "Please enter a valid phone number (e.g., +1234567890 or 1234567890)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function showToast(message) {
    const successDiv = document.createElement("div");
    successDiv.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => {
      if (successDiv.parentNode) document.body.removeChild(successDiv);
    }, 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");

      if (staffId) {
        // Update
        await api.put(`/staff/${staffId}`, form);
        showToast("✅ Staff member updated successfully!");
      } else {
        // Create
        await api.post("/staff", form);
        showToast("✅ Staff member created successfully!");
        // reset only after create
        setForm({
          name: "",
          email: "",
          phone: "",
          role: "Driver",
          assignedBus: "",
        });
      }

      setErrors({});
      if (onCreated) onCreated();

      // short delay so user sees the toast, then go back to list
      setTimeout(() => navigate("/staff/list"), 1100);
    } catch (e) {
      console.error("Error saving staff:", e);
      if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else if (e.message) {
        setError(e.message);
      } else if (e.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
      } else {
        setError("Failed to save staff member. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-slate-400">Loading staff details...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">
          {staffId ? "Edit Staff Member" : "Add New Staff Member"}
        </h2>
        <p className="text-slate-400">
          {staffId
            ? "Update the details of this staff member"
            : "Fill in the details to register a new team member"}
        </p>

        {/* Connection Status Indicator */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={`bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role *
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Driver">Driver</option>
              <option value="Conductor">Conductor</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={`bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g., +1234567890 or 1234567890"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={`bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Assigned Bus (Optional)
          </label>
          <input
            type="text"
            placeholder="Enter bus number or identifier"
            value={form.assignedBus}
            onChange={(e) => update("assignedBus", e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => navigate("/staff/list")}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              <span className="mr-2">📋</span>
              View Staff List
            </button>
            <button
              type="button"
              onClick={() => navigate("/staff/profile")}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              <span className="mr-2">👤</span>
              Staff Profiles
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  role: "Driver",
                  assignedBus: "",
                });
                setErrors({});
                setError("");
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              {submitting ? (
                <>
                  <div className="spinner mr-2" />
                  {staffId ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <span className="mr-2">👤</span>
                  {staffId ? "Update Staff" : "Create Staff Member"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
