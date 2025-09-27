import React, { useEffect, useState } from "react";
import { partsApi } from "../api/client";
import { toast } from "react-toastify";

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({
    partId: "",
    name: "",
    category: "",
    supplier: "",
    cost: "",
    stockQty: "",
    minThreshold: "",
    location: "",
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const data = await partsApi.list();
      setParts(data);
    } catch (e) {
      toast.error("Failed to load parts", e);
    }
  };

  // Check if a part ID already exists (to prevent duplicates)
  const checkPartIdExists = (partId) => {
    return parts.some(
      (part) => part.partId === partId && part._id !== editingId
    );
  };

  const loadReport = async () => {
    try {
      const r = await partsApi.report();
      setReport(r);
    } catch (e) {
      toast.error("Failed to load parts report", e);
    }
  };

  useEffect(() => {
    load();
    loadReport();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.partId.trim()) {
      toast.error("Part ID is required");
      return;
    }

    // Check for duplicate part ID when adding new part
    if (!editingId && checkPartIdExists(form.partId.trim())) {
      toast.error("Part ID already exists. Please use a unique ID.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    // Validate number fields
    if (form.cost && isNaN(Number(form.cost))) {
      toast.error("Cost must be a valid number");
      return;
    }

    if (form.stockQty && isNaN(Number(form.stockQty))) {
      toast.error("Stock Quantity must be a valid number");
      return;
    }

    if (form.minThreshold && isNaN(Number(form.minThreshold))) {
      toast.error("Min Threshold must be a valid number");
      return;
    }

    try {
      // Create the data object with clean number conversions
      const partData = {
        partId: form.partId.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        supplier: form.supplier.trim(),
        location: form.location.trim(),
      };

      // Only add number fields if they have valid values
      if (form.cost && !isNaN(Number(form.cost))) {
        partData.cost = Number(form.cost);
      }

      if (form.stockQty && !isNaN(Number(form.stockQty))) {
        partData.stockQty = Number(form.stockQty);
      }

      if (form.minThreshold && !isNaN(Number(form.minThreshold))) {
        partData.minThreshold = Number(form.minThreshold);
      }

      if (editingId) {
        await partsApi.update(editingId, partData);
        toast.success("Part updated");
      } else {
        await partsApi.create(partData);
        toast.success("Part added");
      }
      setForm({
        partId: "",
        name: "",
        category: "",
        supplier: "",
        cost: "",
        stockQty: "",
        minThreshold: "",
        location: "",
      });
      setEditingId(null);
      await load();
      await loadReport();
    } catch (e) {
      console.error("Part operation failed:", e.response?.data || e);
      toast.error(
        e?.response?.data?.message ||
          (editingId ? "Failed to update part" : "Failed to add part")
      );
    }
  };

  const onEdit = (p) => {
    setEditingId(p._id);
    setForm({
      partId: p.partId || "",
      name: p.name || "",
      category: p.category || "",
      supplier: p.supplier || "",
      cost: p.cost ?? "",
      stockQty: p.stockQty ?? "",
      minThreshold: p.minThreshold ?? "",
      location: p.location || "",
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm({
      partId: "",
      name: "",
      category: "",
      supplier: "",
      cost: "",
      stockQty: "",
      minThreshold: "",
      location: "",
    });
  };

  const onDelete = async (id) => {
    try {
      await partsApi.remove(id);
      toast.success("Part deleted");
      await load();
      await loadReport();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete part");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Parts</h1>

      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2 text-sm font-medium text-white">Part ID</div>
              <input
                id="partId"
                value={form.partId}
                onChange={(e) => setForm({ ...form, partId: e.target.value })}
                placeholder="Part ID"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">Name</div>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Category
              </div>
              <input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Supplier
              </div>
              <input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Supplier"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">Cost</div>
              <input
                id="cost"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="Cost"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Stock Qty
              </div>
              <input
                id="stockQty"
                value={form.stockQty}
                onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                placeholder="Stock Qty"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Min Threshold
              </div>
              <input
                id="minThreshold"
                value={form.minThreshold}
                onChange={(e) =>
                  setForm({ ...form, minThreshold: e.target.value })
                }
                placeholder="Min Threshold"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Location
              </div>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <span className="text-lg mr-2">🔧</span>
              {editingId ? "Save Changes" : "Add Part"}
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
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold">Inventory Report</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg">
              <div className="font-medium text-yellow-300 mb-1">Low Stock</div>
              <div className="text-2xl font-bold text-white">
                {report.lowStockCount}
              </div>
            </div>
            <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg">
              <div className="font-medium text-red-300 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-white">
                {report.outOfStockCount}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <div className="text-sm font-medium">Low Stock Items</div>
              </div>
              <ul className="space-y-2">
                {report.lowStock?.map((p) => (
                  <li key={p._id} className="text-sm flex items-center">
                    <span className="mr-2">•</span>
                    <span>
                      {p.name} ({p.stockQty}/{p.minThreshold})
                    </span>
                  </li>
                ))}
                {(!report.lowStock || report.lowStock.length === 0) && (
                  <li className="text-sm text-gray-400">No low stock items</li>
                )}
              </ul>
            </div>
            <div>
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <div className="text-sm font-medium">Out of Stock Items</div>
              </div>
              <ul className="space-y-2">
                {report.outOfStock?.map((p) => (
                  <li key={p._id} className="text-sm flex items-center">
                    <span className="mr-2">•</span>
                    <span>{p.name}</span>
                  </li>
                ))}
                {(!report.outOfStock || report.outOfStock.length === 0) && (
                  <li className="text-sm text-gray-400">
                    No out of stock items
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden mb-6 shadow-lg">
        <table className="w-full text-sm text-white">
          <thead className="bg-slate-700 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Part ID</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-400" colSpan="8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🔧</span>
                    <span>No parts found</span>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((p) => (
                <tr key={p._id} className="border-b border-slate-700">
                  <td className="px-4 py-3 font-medium">{p.partId}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-900 text-white px-3 py-0.5 rounded-full text-xs">
                      {p.category || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.supplier || "N/A"}</td>
                  <td className="px-4 py-3">${p.cost || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-sm text-xs ${
                        p.stockQty <= 0
                          ? "bg-red-900 text-red-100"
                          : p.stockQty <= (p.minThreshold || 0)
                          ? "bg-yellow-700 text-yellow-100"
                          : "bg-green-900 text-green-100"
                      }`}
                    >
                      {p.stockQty || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.location || "N/A"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => onDelete(p._id)}
                        className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
