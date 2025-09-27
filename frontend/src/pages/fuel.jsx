import React, { useEffect, useState } from "react";
import { fuelApi, vehiclesApi } from "../api/client";
import { toast } from "react-toastify";

export default function FuelPage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({
    vehicleNumber: "",
    liters: "",
    costPerLiter: "",
    totalCost: "",
    odometer: "",
    date: "",
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const [list, vs] = await Promise.all([
        fuelApi.list(),
        vehiclesApi.list(),
      ]);
      setRecords(list);
      setVehicles(vs);
    } catch (e) {
      toast.error("Failed to load fuel data", e);
    }
  };

  const loadReport = async () => {
    try {
      const r = await fuelApi.report({});
      setReport(r);
    } catch (e) {
      toast.error("Failed to load fuel report", e);
    }
  };

  useEffect(() => {
    load();
    loadReport();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fuelApi.update(editingId, {
          vehicleNumber: form.vehicleNumber,
          liters: form.liters ? Number(form.liters) : undefined,
          costPerLiter: form.costPerLiter
            ? Number(form.costPerLiter)
            : undefined,
          totalCost: form.totalCost ? Number(form.totalCost) : undefined,
          odometer: form.odometer ? Number(form.odometer) : undefined,
          date: form.date ? new Date(form.date) : undefined,
        });
        toast.success("Fuel record updated");
      } else {
        await fuelApi.create({
          vehicleNumber: form.vehicleNumber,
          liters: form.liters ? Number(form.liters) : undefined,
          costPerLiter: form.costPerLiter
            ? Number(form.costPerLiter)
            : undefined,
          totalCost: form.totalCost ? Number(form.totalCost) : undefined,
          odometer: form.odometer ? Number(form.odometer) : undefined,
          date: form.date ? new Date(form.date) : undefined,
        });
        toast.success("Fuel record added");
      }
      setForm({
        vehicleNumber: "",
        liters: "",
        costPerLiter: "",
        totalCost: "",
        odometer: "",
        date: "",
      });
      setEditingId(null);
      await load();
      await loadReport();
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          (editingId
            ? "Failed to update fuel record"
            : "Failed to add fuel record")
      );
    }
  };

  const onEdit = (r) => {
    setEditingId(r._id);
    setForm({
      vehicleNumber: r.vehicleNumber || "",
      liters: r.liters ?? "",
      costPerLiter: r.costPerLiter ?? "",
      totalCost: r.totalCost ?? "",
      odometer: r.odometer ?? "",
      date: r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm({
      vehicleNumber: "",
      liters: "",
      costPerLiter: "",
      totalCost: "",
      odometer: "",
      date: "",
    });
  };

  const onDelete = async (id) => {
    try {
      await fuelApi.remove(id);
      toast.success("Fuel record deleted");
      await load();
      await loadReport();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete fuel record");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-semibold animate-slideIn">Fuel</h1>

      <form
        onSubmit={onSubmit}
        className="card hover-lift animate-scaleIn max-w-2xl"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label htmlFor="vehicleNumber" className="mb-1 font-medium">
              Vehicle
            </label>
            <select
              id="vehicleNumber"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({ ...form, vehicleNumber: e.target.value })
              }
              className="form-input focus-ring"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v.plateNumber}>
                  {v.plateNumber} ({v.model})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="liters" className="mb-1 font-medium">
              Liters
            </label>
            <input
              id="liters"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              placeholder="Liters"
              className="form-input focus-ring"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="costPerLiter" className="mb-1 font-medium">
              Cost per Liter
            </label>
            <input
              id="costPerLiter"
              value={form.costPerLiter}
              onChange={(e) =>
                setForm({ ...form, costPerLiter: e.target.value })
              }
              placeholder="Cost per Liter"
              className="form-input focus-ring"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="totalCost" className="mb-1 font-medium">
              Total Cost
            </label>
            <input
              id="totalCost"
              value={form.totalCost}
              onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
              placeholder="Total Cost"
              className="form-input focus-ring"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="odometer" className="mb-1 font-medium">
              Odometer
            </label>
            <input
              id="odometer"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              placeholder="Odometer"
              className="form-input focus-ring"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="date" className="mb-1 font-medium">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="form-input focus-ring"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary hover-glow">
            <span className="text-lg mr-2">⛽</span>
            {editingId ? "Save Changes" : "Add Fuel"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn-secondary"
            >
              <span className="text-lg mr-2">❌</span>
              Cancel
            </button>
          )}
        </div>
      </form>

      {report && (
        <div className="card hover-lift animate-scaleIn">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Fuel Report
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-700">Records</div>
              <div className="text-xl font-bold text-blue-900">
                {report.records}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-700">Total KM</div>
              <div className="text-xl font-bold text-green-900">
                {report.km?.toLocaleString() || "N/A"}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-medium text-yellow-700">Total Liters</div>
              <div className="text-xl font-bold text-yellow-900">
                {report.liters?.toFixed(2) || "N/A"}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-700">KM/L</div>
              <div className="text-xl font-bold text-purple-900">
                {report.kmPerL?.toFixed(2) || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card hover-lift animate-scaleIn overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Vehicle</th>
              <th className="p-2">Liters</th>
              <th className="p-2">Total Cost</th>
              <th className="p-2">Odometer</th>
              <th className="p-2">Date</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td className="p-2 text-center py-8 text-gray-500" colSpan="6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">⛽</span>
                    <span>No fuel records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r, index) => (
                <tr
                  key={r._id}
                  className="table-row animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="p-2 font-medium">{r.vehicleNumber}</td>
                  <td className="p-2">{r.liters}L</td>
                  <td className="p-2">${r.totalCost}</td>
                  <td className="p-2">
                    {r.odometer?.toLocaleString() || "N/A"}
                  </td>
                  <td className="p-2">
                    {r.date ? new Date(r.date).toLocaleDateString() : ""}
                  </td>
                  <td className="p-2 text-right flex gap-3 justify-end">
                    <button
                      onClick={() => onEdit(r)}
                      className="btn-secondary hover-scale text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(r._id)}
                      className="btn-danger hover-scale text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
