import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";

export default function AssignStaff({ onAssignmentComplete }) {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [bus, setBus] = useState("");
  const [msg, setMsg] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStaff() {
      try {
        const res = await api.get("/staff");
        if (!cancelled) setStaff(res.data || []);
      } catch (error) {
        console.error("Error fetching staff:", error);
        if (!cancelled)
          setMsg("Failed to load staff members. Please try again.");
      }
    }

    fetchStaff();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAssign(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    if (!id || !bus) {
      setMsg("Please select a staff member and enter a bus number");
      setLoading(false);
      return;
    }

    try {
      await api.put(`/staff/assign/${id}`, { assignedBus: bus });
      setMsg("Assigned successfully");
      setId("");
      setBus("");
      if (onAssignmentComplete) onAssignmentComplete();

      // Show success toast
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      successDiv.textContent = "✅ Bus assigned successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Failed to assign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">
          Assign Bus to Staff
        </h2>
        <p className="text-slate-400">
          Assign a bus to a staff member for their daily operations
        </p>
      </div>

      <form onSubmit={handleAssign} className="space-y-6">
        {msg && (
          <div
            className={`p-4 rounded-lg ${
              msg.includes("successfully")
                ? "bg-green-900 border border-green-700 text-green-200"
                : "bg-red-900 border border-red-700 text-red-200"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {msg.includes("successfully") ? "✅" : "⚠️"}
              </span>
              <p>{msg}</p>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Staff Member *</label>
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a staff member</option>
            {staff.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.role || s.position})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-slate-300 mb-2">Bus Number *</label>
          <input
            placeholder="Enter bus number or identifier"
            value={bus}
            onChange={(e) => setBus(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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
              Staff List
            </button>
            <button
              type="button"
              onClick={() => navigate("/staff/create")}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              <span className="mr-2">➕</span>
              Add Staff
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setId("");
                setBus("");
                setMsg("");
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <span className="mr-2">🚌</span>
                  Assign Bus
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
