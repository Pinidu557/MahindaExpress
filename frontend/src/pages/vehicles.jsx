import React, { useEffect, useState } from "react";
import { vehiclesApi } from "../api/client";
import { toast } from "react-toastify";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ vehicleNumber: "", model: "", year: "", mileage: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.list();
      setVehicles(data);
    } catch (e) {
      toast.error("Failed to load vehicles. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await vehiclesApi.update(editingId, {
          vehicleNumber: form.vehicleNumber,
          model: form.model,
          year: form.year ? Number(form.year) : undefined,
          mileage: form.mileage ? Number(form.mileage) : undefined
        });
        toast.success("Vehicle updated");
      } else {
        await vehiclesApi.create({
          vehicleNumber: form.vehicleNumber,
          model: form.model,
          year: form.year ? Number(form.year) : undefined,
          mileage: form.mileage ? Number(form.mileage) : undefined
        });
        toast.success("Vehicle added");
      }
      setForm({ vehicleNumber: "", model: "", year: "", mileage: "" });
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || (editingId ? "Failed to update vehicle" : "Failed to add vehicle"));
    }
  };

  const onDelete = async (id) => {
    try {
      await vehiclesApi.remove(id);
      toast.success("Vehicle deleted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const onEdit = (v) => {
    setEditingId(v._id);
    setForm({
      vehicleNumber: v.vehicleNumber || "",
      model: v.model || "",
      year: v.year ?? "",
      mileage: v.mileage ?? ""
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm({ vehicleNumber: "", model: "", year: "", mileage: "" });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-semibold animate-slideIn">Vehicles</h1>

      <form onSubmit={onSubmit} className="card hover-lift animate-scaleIn max-w-xl">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label htmlFor="vehicleNumber" className="mb-1 font-medium">Vehicle Number</label>
            <input 
              id="vehicleNumber"
              value={form.vehicleNumber} 
              onChange={e=>setForm({...form, vehicleNumber:e.target.value})} 
              placeholder="Vehicle Number" 
              className="form-input focus-ring" 
              required 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="model" className="mb-1 font-medium">Model</label>
            <input 
              id="model"
              value={form.model} 
              onChange={e=>setForm({...form, model:e.target.value})} 
              placeholder="Model" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="year" className="mb-1 font-medium">Year</label>
            <input 
              id="year"
              value={form.year} 
              onChange={e=>setForm({...form, year:e.target.value})} 
              placeholder="Year" 
              className="form-input focus-ring" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="mileage" className="mb-1 font-medium">Mileage</label>
            <input 
              id="mileage"
              value={form.mileage} 
              onChange={e=>setForm({...form, mileage:e.target.value})} 
              placeholder="Mileage" 
              className="form-input focus-ring" 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary hover-glow">
            <span className="text-lg mr-2">🚗</span>
            {editingId ? "Save Changes" : "Add Vehicle"}
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit} className="btn-secondary">
              <span className="text-lg mr-2">❌</span>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card hover-lift animate-scaleIn overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Vehicle Number</th>
              <th className="p-2">Model</th>
              <th className="p-2">Year</th>
              <th className="p-2">Mileage</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
            <tr>
                <td className="p-2 text-center py-8" colSpan="5">
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  <span>Loading vehicles...</span>
                </div>
              </td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
                <td className="p-2 text-center py-8 text-gray-500" colSpan="5">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🚗</span>
                  <span>No vehicles found</span>
                </div>
              </td>
            </tr>
          ) : vehicles.map((v, index) => (
            <tr key={v._id} className="table-row animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
              <td className="p-2 font-medium">{v.vehicleNumber}</td>
              <td className="p-2">{v.model}</td>
              <td className="p-2">{v.year}</td>
              <td className="p-2">{v.mileage?.toLocaleString() || 'N/A'}</td>
              <td className="p-2 text-right flex gap-3 justify-end">
                <button 
                  onClick={()=>onEdit(v)} 
                  className="btn-secondary hover-scale text-sm"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={()=>onDelete(v._id)} 
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


