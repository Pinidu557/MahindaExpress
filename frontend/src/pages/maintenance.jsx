import React, { useEffect, useState } from "react";
import { maintenanceApi, vehiclesApi, partsApi } from "../api/client";
import { toast } from "react-toastify";

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [reminders, setReminders] = useState(null);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({
    vehicleNumber: "",
    serviceType: "",
    serviceDate: "",
    mechanicId: "",
    serviceCost: "",
    notes: "",
    mileageAtService: "",
    nextServiceDate: "",
    nextServiceMileage: "",
    status: "pending",
    partsUsed: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    try {
      const [recs, vs, ps] = await Promise.all([
        maintenanceApi.list(),
        vehiclesApi.list(),
        partsApi.list(),
      ]);
      setRecords(recs);
      setVehicles(vs);
      setParts(ps);
    } catch (e) {
      toast.error("Failed to load maintenance data", e);
    }
  };

  const loadMeta = async () => {
    try {
      const [rmd, rpt] = await Promise.all([
        maintenanceApi.reminders({ days: 7, km: 500 }),
        maintenanceApi.report({}),
      ]);
      setReminders(rmd);
      setReport(rpt);
    } catch (e) {
      toast.error("Failed to load maintenance reports/reminders", e);
    }
  };

  useEffect(() => {
    load();
    loadMeta();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }

    // Validate required fields
    if (!form.vehicleNumber || !form.serviceType || !form.serviceDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Date validations
    const serviceDateObj = new Date(form.serviceDate);
    if (Number.isNaN(serviceDateObj.getTime())) {
      toast.error("Service date is invalid");
      return;
    }
    if (form.nextServiceDate) {
      const nextServiceDateObj = new Date(form.nextServiceDate);
      if (Number.isNaN(nextServiceDateObj.getTime())) {
        toast.error("Next service date is invalid");
        return;
      }
      if (nextServiceDateObj < serviceDateObj) {
        toast.error("Next service date cannot be before service date");
        return;
      }
    }

    // Numeric validations
    const numOrUndefined = (v) =>
      v === "" || v === null || v === undefined ? undefined : Number(v);
    const serviceCostNum = numOrUndefined(form.serviceCost);
    if (
      serviceCostNum !== undefined &&
      (!Number.isFinite(serviceCostNum) || serviceCostNum < 0)
    ) {
      toast.error("Service cost must be a non-negative number");
      return;
    }
    const mileageAtServiceNum = numOrUndefined(form.mileageAtService);
    if (
      mileageAtServiceNum !== undefined &&
      (!Number.isInteger(mileageAtServiceNum) || mileageAtServiceNum < 0)
    ) {
      toast.error("Mileage at service must be a non-negative integer");
      return;
    }
    const nextServiceMileageNum = numOrUndefined(form.nextServiceMileage);
    if (
      nextServiceMileageNum !== undefined &&
      (!Number.isInteger(nextServiceMileageNum) || nextServiceMileageNum < 0)
    ) {
      toast.error("Next service mileage must be a non-negative integer");
      return;
    }
    if (
      mileageAtServiceNum !== undefined &&
      nextServiceMileageNum !== undefined &&
      nextServiceMileageNum < mileageAtServiceNum
    ) {
      toast.error(
        "Next service mileage cannot be less than mileage at service"
      );
      return;
    }
    // Parts qty validation
    for (const row of form.partsUsed) {
      if (row.part && row.qty !== "") {
        const qtyNum = Number(row.qty);
        if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
          toast.error("Each part quantity must be a positive integer");
          return;
        }
      }
    }

    setIsSubmitting(true);

    const payload = {
      vehicleNumber: form.vehicleNumber,
      serviceType: form.serviceType,
      serviceDate: form.serviceDate, // validated above
      mechanicId: form.mechanicId || undefined,
      serviceCost: serviceCostNum,
      notes: form.notes || undefined,
      mileageAtService: mileageAtServiceNum,
      nextServiceDate: form.nextServiceDate || undefined,
      nextServiceMileage: nextServiceMileageNum,
      status: form.status,
      partsUsed: form.partsUsed
        .filter((p) => p.part && p.qty)
        .map((p) => ({ part: p.part, qty: Number(p.qty) })),
    };
    try {
      console.log("Sending payload:", payload); // Debug log
      if (editingId) {
        await maintenanceApi.update(editingId, payload);
        toast.success("Maintenance updated");
      } else {
        await maintenanceApi.create(payload);
        toast.success("Maintenance added");
      }
      setForm({
        vehicleNumber: "",
        serviceType: "",
        serviceDate: "",
        mechanicId: "",
        serviceCost: "",
        notes: "",
        mileageAtService: "",
        nextServiceDate: "",
        nextServiceMileage: "",
        status: "pending",
        partsUsed: [],
      });
      setEditingId(null);
      await load();
      await loadMeta();
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          (editingId
            ? "Failed to update maintenance"
            : "Failed to add maintenance")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEdit = (r) => {
    setEditingId(r._id);
    setForm({
      vehicleNumber: r.vehicleNumber || "",
      serviceType: r.serviceType || "",
      serviceDate: r.serviceDate ? r.serviceDate.slice(0, 10) : "",
      mechanicId: r.mechanicId || "",
      serviceCost: r.serviceCost ?? "",
      notes: r.notes || "",
      mileageAtService: r.mileageAtService ?? "",
      nextServiceDate: r.nextServiceDate ? r.nextServiceDate.slice(0, 10) : "",
      nextServiceMileage: r.nextServiceMileage ?? "",
      status: r.status || "pending",
      partsUsed: (r.partsUsed || []).map((p) => ({
        part: p.part?._id || "",
        qty: p.qty ?? 1,
      })),
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm({
      vehicleNumber: "",
      serviceType: "",
      serviceDate: "",
      mechanicId: "",
      serviceCost: "",
      notes: "",
      mileageAtService: "",
      nextServiceDate: "",
      nextServiceMileage: "",
      status: "pending",
      partsUsed: [],
    });
  };

  const onDelete = async (id) => {
    try {
      await maintenanceApi.remove(id);
      toast.success("Maintenance deleted");
      await load();
      await loadMeta();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete maintenance");
    }
  };

  const addPartRow = () =>
    setForm((f) => ({
      ...f,
      partsUsed: [...f.partsUsed, { part: "", qty: "" }],
    }));
  const updatePartRow = (idx, key, value) => {
    const copy = [...form.partsUsed];
    copy[idx] = { ...copy[idx], [key]: value };
    setForm({ ...form, partsUsed: copy });
  };
  const removePartRow = (idx) =>
    setForm({ ...form, partsUsed: form.partsUsed.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6 animate-fadeIn bg-slate-900 text-white p-6 min-h-screen">
      <h1 className="text-2xl font-semibold animate-slideIn text-white">
        Maintenance
      </h1>

      <form
        onSubmit={onSubmit}
        className="card hover-lift animate-scaleIn bg-slate-800 border border-slate-700"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label
              htmlFor="vehicleNumber"
              className="mb-1 font-medium text-gray-200"
            >
              Vehicle
            </label>
            <select
              id="vehicleNumber"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({ ...form, vehicleNumber: e.target.value })
              }
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
              required
            >
              <option value="" className="bg-slate-800 text-white">
                Select Vehicle
              </option>
              {vehicles.map((v) => (
                <option
                  key={v._id}
                  value={v.plateNumber}
                  className="bg-slate-800 text-white"
                >
                  {v.plateNumber} ({v.model})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="serviceType"
              className="mb-1 font-medium text-gray-200"
            >
              Service Type
            </label>
            <input
              id="serviceType"
              value={form.serviceType}
              onChange={(e) =>
                setForm({ ...form, serviceType: e.target.value })
              }
              placeholder="Service Type"
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="serviceDate"
              className="mb-1 font-medium text-gray-200"
            >
              Service Date
            </label>
            <input
              id="serviceDate"
              type="date"
              value={form.serviceDate}
              onChange={(e) =>
                setForm({ ...form, serviceDate: e.target.value })
              }
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="mechanicId"
              className="mb-1 font-medium text-gray-200"
            >
              Mechanic Name
            </label>
            <input
              id="mechanicId"
              value={form.mechanicId}
              onChange={(e) => setForm({ ...form, mechanicId: e.target.value })}
              placeholder="Mechanic Name"
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="serviceCost"
              className="mb-1 font-medium text-gray-200"
            >
              Service Cost
            </label>
            <input
              id="serviceCost"
              value={form.serviceCost}
              onChange={(e) =>
                setForm({ ...form, serviceCost: e.target.value })
              }
              placeholder="Service Cost"
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="mileageAtService"
              className="mb-1 font-medium text-gray-200"
            >
              Mileage at Service
            </label>
            <input
              id="mileageAtService"
              value={form.mileageAtService}
              onChange={(e) =>
                setForm({ ...form, mileageAtService: e.target.value })
              }
              placeholder="Mileage at Service"
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="nextServiceDate"
              className="mb-1 font-medium text-gray-200"
            >
              Next Service Date
            </label>
            <input
              id="nextServiceDate"
              type="date"
              value={form.nextServiceDate}
              onChange={(e) =>
                setForm({ ...form, nextServiceDate: e.target.value })
              }
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="nextServiceMileage"
              className="mb-1 font-medium text-gray-200"
            >
              Next Service Mileage
            </label>
            <input
              id="nextServiceMileage"
              value={form.nextServiceMileage}
              onChange={(e) =>
                setForm({ ...form, nextServiceMileage: e.target.value })
              }
              placeholder="Next Service Mileage"
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="status" className="mb-1 font-medium text-gray-200">
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
            >
              <option value="pending" className="bg-slate-800 text-white">
                Pending
              </option>
              <option value="completed" className="bg-slate-800 text-white">
                Completed
              </option>
            </select>
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <label htmlFor="notes" className="mb-1 font-medium text-gray-200">
            Notes
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
            className="form-input focus-ring w-full bg-slate-800 border-slate-700 text-white"
            rows="3"
          />
        </div>

        <div className="space-y-2">
          <div className="font-medium flex items-center gap-2 text-white">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Parts Used
          </div>
          {form.partsUsed.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 animate-fadeIn">
              <div className="flex flex-col">
                <label
                  htmlFor={`part-${idx}`}
                  className="mb-1 font-medium text-gray-200"
                >
                  Part
                </label>
                <select
                  id={`part-${idx}`}
                  value={row.part}
                  onChange={(e) => updatePartRow(idx, "part", e.target.value)}
                  className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
                >
                  <option value="" className="bg-slate-800 text-white">
                    Select Part
                  </option>
                  {parts.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                      className="bg-slate-800 text-white"
                    >
                      {p.name} ({p.stockQty})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor={`qty-${idx}`}
                  className="mb-1 font-medium text-gray-200"
                >
                  Quantity
                </label>
                <input
                  id={`qty-${idx}`}
                  value={row.qty}
                  onChange={(e) => updatePartRow(idx, "qty", e.target.value)}
                  placeholder="Quantity"
                  className="form-input focus-ring bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => removePartRow(idx)}
                  className="btn-danger hover-scale text-sm"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPartRow}
            className="btn-secondary hover-glow"
          >
            <span className="text-lg mr-2">➕</span>
            Add Part
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isSubmitting
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "btn-primary hover-glow"
            } flex items-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="text-lg">🔧</span>
                {editingId ? "Save Changes" : "Add Maintenance"}
              </>
            )}
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

      {reminders && (
        <div className="card hover-lift animate-scaleIn bg-slate-800 border border-slate-700">
          <h2 className="font-semibold mb-2 flex items-center gap-2 text-white">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Reminders
          </h2>
          <div className="text-sm text-gray-200 mb-4 p-2 bg-slate-700 rounded">
            Window: {reminders.config.daysWindow} days /{" "}
            {reminders.config.kmWindow} km
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2 text-gray-200">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Due by Date
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                {reminders.dueByDate.map((r, index) => (
                  <li
                    key={r._id}
                    className="animate-slideIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {r.vehicleNumber} - {r.serviceType} on{" "}
                    {new Date(r.nextServiceDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Due by Mileage
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {reminders.dueByMileage.map((r, index) => (
                  <li
                    key={r._id}
                    className="animate-slideIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {r.vehicleNumber} - {r.serviceType} at{" "}
                    {r.nextServiceMileage}km
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card hover-lift animate-scaleIn overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-200">
          <thead className="text-gray-300 bg-slate-800">
            <tr>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Service Type</th>
              <th className="p-2">Date</th>
              <th className="p-2">Cost</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td className="p-2 text-center py-8 text-gray-400" colSpan="6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🔧</span>
                    <span>No maintenance records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r, index) => (
                <tr
                  key={r._id}
                  className="table-row animate-fadeIn border-b border-slate-700"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="p-2 font-medium">{r.vehicleNumber}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-blue-800 text-blue-100 rounded-full text-xs">
                      {r.serviceType}
                    </span>
                  </td>
                  <td className="p-2">
                    {r.serviceDate
                      ? new Date(r.serviceDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="p-2">${r.serviceCost || "N/A"}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.status === "completed"
                          ? "bg-green-800 text-green-100"
                          : "bg-yellow-800 text-yellow-100"
                      }`}
                    >
                      {r.status}
                    </span>
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

      {report && (
        <div className="bg-slate-700 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Report</h2>
          <div className="text-sm">
            Total Records: {report.summary.records} • Total Cost:{" "}
            {report.summary.totalCost}
          </div>
          <div className="text-sm mt-2">By Service Type:</div>
          <ul className="list-disc list-inside text-sm">
            {report.byServiceType.map((x, i) => (
              <li key={i}>
                {x._id}: {x.count} records, {x.totalCost} cost
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
