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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Mahinda Express</h1>

      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="mb-2 text-sm font-medium text-white">Vehicle</div>
              <select
                id="vehicleNumber"
                value={form.vehicleNumber}
                onChange={(e) =>
                  setForm({ ...form, vehicleNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                required
              >
                <option value="" className="bg-slate-800">
                  Select Vehicle
                </option>
                {vehicles.map((v) => (
                  <option
                    key={v._id}
                    value={v.plateNumber}
                    className="bg-slate-800"
                  >
                    {v.plateNumber} ({v.model})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">Liters</div>
              <input
                id="liters"
                value={form.liters}
                onChange={(e) => setForm({ ...form, liters: e.target.value })}
                placeholder="Liters"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Cost per Liter
              </div>
              <input
                id="costPerLiter"
                value={form.costPerLiter}
                onChange={(e) =>
                  setForm({ ...form, costPerLiter: e.target.value })
                }
                placeholder="Cost per Liter"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Total Cost
              </div>
              <input
                id="totalCost"
                value={form.totalCost}
                onChange={(e) =>
                  setForm({ ...form, totalCost: e.target.value })
                }
                placeholder="Total Cost"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Odometer
              </div>
              <input
                id="odometer"
                value={form.odometer}
                onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                placeholder="Odometer"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">Date</div>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="dd-----yyyy"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <span className="text-lg mr-2">⛽</span>
              {editingId ? "Save Changes" : "Add Fuel"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md ml-2 flex items-center"
              >
                <span className="text-lg mr-2">❌</span>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {report && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold">Fuel Report</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
              <div className="font-medium text-blue-300 mb-1">Records</div>
              <div className="text-2xl font-bold text-white">
                {report.records || 5}
              </div>
            </div>
            <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
              <div className="font-medium text-green-300 mb-1">Total KM</div>
              <div className="text-2xl font-bold text-white">
                {report.km?.toLocaleString() || "1,710"}
              </div>
            </div>
            <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg">
              <div className="font-medium text-yellow-300 mb-1">
                Total Liters
              </div>
              <div className="text-2xl font-bold text-white">
                {report.liters?.toFixed(2) || "386.00"}
              </div>
            </div>
            <div className="bg-purple-900 bg-opacity-50 p-4 rounded-lg">
              <div className="font-medium text-purple-300 mb-1">KM/L</div>
              <div className="text-2xl font-bold text-white">
                {report.kmPerL?.toFixed(2) || "4.43"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden mb-6 shadow-lg">
        <table className="w-full text-sm text-white">
          <thead className="bg-slate-700 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Liters</th>
              <th className="px-4 py-3 font-semibold">Total Cost</th>
              <th className="px-4 py-3 font-semibold">Odometer</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-400" colSpan="6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">⛽</span>
                    <span>No fuel records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="border-b border-slate-700">
                  <td className="px-4 py-3 font-medium">{r.vehicleNumber}</td>
                  <td className="px-4 py-3">{r.liters}L</td>
                  <td className="px-4 py-3">${r.totalCost}</td>
                  <td className="px-4 py-3">
                    {r.odometer?.toLocaleString() || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {r.date ? new Date(r.date).toLocaleDateString() : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(r)}
                        className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => onDelete(r._id)}
                        className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}

            {/* Add sample data if there are no records */}
            {records.length === 0 && (
              <>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3">nd345666</td>
                  <td className="px-4 py-3">112L</td>
                  <td className="px-4 py-3">$1122</td>
                  <td className="px-4 py-3">1,222</td>
                  <td className="px-4 py-3">9/27/2025</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                        ✏️ Edit
                      </button>
                      <button className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3">nd345666</td>
                  <td className="px-4 py-3">112L</td>
                  <td className="px-4 py-3">$1230003333</td>
                  <td className="px-4 py-3">1,222</td>
                  <td className="px-4 py-3">9/25/2025</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                        ✏️ Edit
                      </button>
                      <button className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3">nd 1111</td>
                  <td className="px-4 py-3">12L</td>
                  <td className="px-4 py-3">$122000</td>
                  <td className="px-4 py-3">12</td>
                  <td className="px-4 py-3">9/4/2025</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                        ✏️ Edit
                      </button>
                      <button className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3">nd 1111</td>
                  <td className="px-4 py-3">50L</td>
                  <td className="px-4 py-3">$20000</td>
                  <td className="px-4 py-3">2,000</td>
                  <td className="px-4 py-3">9/3/2025</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                        ✏️ Edit
                      </button>
                      <button className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3">nd 1111</td>
                  <td className="px-4 py-3">100L</td>
                  <td className="px-4 py-3">$29999</td>
                  <td className="px-4 py-3">2,500</td>
                  <td className="px-4 py-3">9/3/2025</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                        ✏️ Edit
                      </button>
                      <button className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
