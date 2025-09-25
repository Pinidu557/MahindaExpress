import React, { useEffect, useState } from "react";
import { partsApi } from "../api/client";
import { toast } from "react-toastify";

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ partId: "", name: "", category: "", supplier: "", cost: "", stockQty: "", minThreshold: "", location: "" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const data = await partsApi.list();
      setParts(data);
    } catch (e) {
      toast.error("Failed to load parts");
    }
  };

  const loadReport = async () => {
    try {
      const r = await partsApi.report();
      setReport(r);
    } catch (e) {
      toast.error("Failed to load parts report");
    }
  };

  useEffect(() => { load(); loadReport(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await partsApi.update(editingId, {
          partId: form.partId,
          name: form.name,
          category: form.category,
          supplier: form.supplier,
          cost: form.cost ? Number(form.cost) : undefined,
          stockQty: form.stockQty ? Number(form.stockQty) : undefined,
          minThreshold: form.minThreshold ? Number(form.minThreshold) : undefined,
          location: form.location
        });
        toast.success("Part updated");
      } else {
        await partsApi.create({
          partId: form.partId,
          name: form.name,
          category: form.category,
          supplier: form.supplier,
          cost: form.cost ? Number(form.cost) : undefined,
          stockQty: form.stockQty ? Number(form.stockQty) : undefined,
          minThreshold: form.minThreshold ? Number(form.minThreshold) : undefined,
          location: form.location
        });
        toast.success("Part added");
      }
      setForm({ partId: "", name: "", category: "", supplier: "", cost: "", stockQty: "", minThreshold: "", location: "" });
      setEditingId(null);
      await load();
      await loadReport();
    } catch (e) {
      toast.error(e?.response?.data?.message || (editingId ? "Failed to update part" : "Failed to add part"));
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
      location: p.location || ""
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm({ partId: "", name: "", category: "", supplier: "", cost: "", stockQty: "", minThreshold: "", location: "" });
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
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-semibold animate-slideIn">Parts</h1>

      <form onSubmit={onSubmit} className="card hover-lift animate-scaleIn">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label htmlFor="partId" className="mb-1 font-medium">Part ID</label>
            <input 
              id="partId"
              value={form.partId} 
              onChange={e=>setForm({...form, partId:e.target.value})} 
              placeholder="Part ID" 
              className="form-input focus-ring" 
              required 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-medium">Name</label>
            <input 
              id="name"
              value={form.name} 
              onChange={e=>setForm({...form, name:e.target.value})} 
              placeholder="Name" 
              className="form-input focus-ring" 
              required 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="category" className="mb-1 font-medium">Category</label>
            <input 
              id="category"
              value={form.category} 
              onChange={e=>setForm({...form, category:e.target.value})} 
              placeholder="Category" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="supplier" className="mb-1 font-medium">Supplier</label>
            <input 
              id="supplier"
              value={form.supplier} 
              onChange={e=>setForm({...form, supplier:e.target.value})} 
              placeholder="Supplier" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="cost" className="mb-1 font-medium">Cost</label>
            <input 
              id="cost"
              value={form.cost} 
              onChange={e=>setForm({...form, cost:e.target.value})} 
              placeholder="Cost" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="stockQty" className="mb-1 font-medium">Stock Qty</label>
            <input 
              id="stockQty"
              value={form.stockQty} 
              onChange={e=>setForm({...form, stockQty:e.target.value})} 
              placeholder="Stock Qty" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="minThreshold" className="mb-1 font-medium">Min Threshold</label>
            <input 
              id="minThreshold"
              value={form.minThreshold} 
              onChange={e=>setForm({...form, minThreshold:e.target.value})} 
              placeholder="Min Threshold" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="location" className="mb-1 font-medium">Location</label>
            <input 
              id="location"
              value={form.location} 
              onChange={e=>setForm({...form, location:e.target.value})} 
              placeholder="Location" 
              className="form-input focus-ring" 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary hover-glow">
            <span className="text-lg mr-2">🔧</span>
            {editingId ? "Save Changes" : "Add Part"}
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit} className="btn-secondary">
              <span className="text-lg mr-2">❌</span>
              Cancel
            </button>
          )}
        </div>
      </form>

      {report && (
        <div className="card hover-lift animate-scaleIn">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            Inventory Report
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-medium text-yellow-700">Low Stock</div>
              <div className="text-xl font-bold text-yellow-900">{report.lowStockCount}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-medium text-red-700">Out of Stock</div>
              <div className="text-xl font-bold text-red-900">{report.outOfStockCount}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Low Stock Items
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {report.lowStock?.map((p, index) => (
                  <li key={p._id} className="animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                    {p.name} ({p.stockQty}/{p.minThreshold})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Out of Stock Items
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {report.outOfStock?.map((p, index) => (
                  <li key={p._id} className="animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card hover-lift animate-scaleIn overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Part ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Cost</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Location</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td className="p-2 text-center py-8 text-gray-500" colSpan="8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🔧</span>
                    <span>No parts found</span>
                  </div>
                </td>
              </tr>
            ) : parts.map((p, index) => (
              <tr key={p._id} className="table-row animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                <td className="p-2 font-medium">{p.partId}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {p.category || 'N/A'}
                  </span>
                </td>
                <td className="p-2">{p.supplier || 'N/A'}</td>
                <td className="p-2">${p.cost || 'N/A'}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    p.stockQty <= 0 ? 'bg-red-100 text-red-800' :
                    p.stockQty <= (p.minThreshold || 0) ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {p.stockQty || 0}
                  </span>
                </td>
                <td className="p-2">{p.location || 'N/A'}</td>
                <td className="p-2 text-right flex gap-3 justify-end">
                  <button 
                    onClick={()=>onEdit(p)} 
                    className="btn-secondary hover-scale text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={()=>onDelete(p._id)} 
                    className="btn-danger hover-scale text-sm"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


