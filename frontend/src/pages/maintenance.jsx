import React, { useEffect, useState } from "react";
import { maintenanceApi, vehiclesApi, partsApi } from "../api/client";
import { toast } from "react-toastify";
import { Wrench, Plus, Calendar, Edit, Trash2 } from "lucide-react";

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
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
    status: "Under Maintenance",
    partsUsed: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Filter records when searchTerm or records change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = records.filter(
      (record) =>
        record.vehicleNumber?.toLowerCase().includes(term) ||
        record.serviceType?.toLowerCase().includes(term) ||
        record.mechanicId?.toLowerCase().includes(term) ||
        record.notes?.toLowerCase().includes(term) ||
        record.status?.toLowerCase().includes(term)
    );

    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  // Prevent invalid characters in mechanic name field
  const handleMechanicNameKeyDown = (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Home', 'End', 'Enter'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    if (/^[a-zA-Z]$/.test(e.key)) return;
    if (e.key === ' ' || e.key === '-' || e.key === "'") return;
    
    e.preventDefault();
    if (/^[0-9]$/.test(e.key)) {
      setErrors((prev) => ({ ...prev, mechanicId: "Numbers are not allowed in mechanic name" }));
    } else {
      setErrors((prev) => ({ ...prev, mechanicId: "Special characters are not allowed in mechanic name" }));
    }
    
    setTimeout(() => {
      setErrors((prev) => ({ ...prev, mechanicId: "" }));
    }, 3000);
  };

  const handleMechanicNameInput = (e) => {
    const value = e.target.value;
    setForm({ ...form, mechanicId: value });
    
    if (errors.mechanicId && /^[a-zA-Z\s'-]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, mechanicId: "" }));
    }
  };

  // Prevent invalid characters in numeric fields (cost, mileage)
  const handleNumberKeyDown = (e, fieldName, allowDecimal = true) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Home', 'End', 'Enter'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    if (/^[0-9]$/.test(e.key)) return;
    if (allowDecimal && e.key === '.' && !e.target.value.includes('.')) return;
    
    e.preventDefault();
    setErrors((prev) => ({ 
      ...prev, 
      [fieldName]: allowDecimal 
        ? "Only numbers and decimal point are allowed" 
        : "Only numbers are allowed"
    }));
    
    setTimeout(() => {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }, 3000);
  };

  const handleNumberInput = (e, fieldName) => {
    const value = e.target.value;
    setForm({ ...form, [fieldName]: value });
    
    if (errors[fieldName] && /^[0-9]*\.?[0-9]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Prevent invalid characters in parts quantity
  const handlePartQtyKeyDown = (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Home', 'End', 'Enter'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    if (/^[0-9]$/.test(e.key)) return;
    
    e.preventDefault();
    setErrors((prev) => ({ ...prev, partQty: "Only numbers are allowed for quantity" }));
    
    setTimeout(() => {
      setErrors((prev) => ({ ...prev, partQty: "" }));
    }, 3000);
  };

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
        status: "Under Maintenance",
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
      status: r.status || "Under Maintenance",
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Maintenance</h1>

      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="mb-2 text-sm font-medium text-white">Vehicle</div>
              <select
                value={form.vehicleNumber}
                onChange={(e) =>
                  setForm({ ...form, vehicleNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-red-500 rounded-lg text-white focus:outline-none"
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
              <div className="mb-2 text-sm font-medium text-white">
                Service Type
              </div>
              <input
                type="text"
                value={form.serviceType}
                onChange={(e) =>
                  setForm({ ...form, serviceType: e.target.value })
                }
                placeholder="Service Type"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Service Date
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={form.serviceDate}
                  onChange={(e) =>
                    setForm({ ...form, serviceDate: e.target.value })
                  }
                  placeholder="dd-----yyyy"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Mechanic Name
              </div>
              <input
                type="text"
                value={form.mechanicId}
                onChange={handleMechanicNameInput}
                onKeyDown={handleMechanicNameKeyDown}
                placeholder="Mechanic Name"
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none ${
                  errors.mechanicId ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.mechanicId && (
                <p className="text-red-400 text-sm mt-1">{errors.mechanicId}</p>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Service Cost
              </div>
              <input
                type="text"
                value={form.serviceCost}
                onChange={(e) => handleNumberInput(e, 'serviceCost')}
                onKeyDown={(e) => handleNumberKeyDown(e, 'serviceCost', true)}
                placeholder="Service Cost"
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none ${
                  errors.serviceCost ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.serviceCost && (
                <p className="text-red-400 text-sm mt-1">{errors.serviceCost}</p>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Mileage at Service
              </div>
              <input
                type="text"
                value={form.mileageAtService}
                onChange={(e) => handleNumberInput(e, 'mileageAtService')}
                onKeyDown={(e) => handleNumberKeyDown(e, 'mileageAtService', false)}
                placeholder="Mileage at Service"
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none ${
                  errors.mileageAtService ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.mileageAtService && (
                <p className="text-red-400 text-sm mt-1">{errors.mileageAtService}</p>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Next Service Date
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={form.nextServiceDate}
                  onChange={(e) =>
                    setForm({ ...form, nextServiceDate: e.target.value })
                  }
                  placeholder="dd-----yyyy"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">
                Next Service Mileage
              </div>
              <input
                type="text"
                value={form.nextServiceMileage}
                onChange={(e) => handleNumberInput(e, 'nextServiceMileage')}
                onKeyDown={(e) => handleNumberKeyDown(e, 'nextServiceMileage', false)}
                placeholder="Next Service Mileage"
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none ${
                  errors.nextServiceMileage ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.nextServiceMileage && (
                <p className="text-red-400 text-sm mt-1">{errors.nextServiceMileage}</p>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-white">Status</div>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
              >
                <option value="Under Maintenance" className="bg-slate-800">
                  Under Maintenance
                </option>
                <option value="Available" className="bg-slate-800">
                  Available
                </option>
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-white">Notes</div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none resize-none"
              rows="4"
            ></textarea>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <div className="text-sm font-medium text-white">Parts Used</div>
            </div>

            <div className="space-y-2 mt-2">
              {form.partsUsed.map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <select
                    value={row.part}
                    onChange={(e) => updatePartRow(idx, "part", e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none text-sm"
                  >
                    <option value="" className="bg-slate-800">
                      Select Part
                    </option>
                    {parts.map((p) => (
                      <option
                        key={p._id}
                        value={p._id}
                        className="bg-slate-800"
                      >
                        {p.name} ({p.stockQty})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={row.qty}
                    onChange={(e) => updatePartRow(idx, "qty", e.target.value)}
                    onKeyDown={handlePartQtyKeyDown}
                    placeholder="Quantity"
                    className={`px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none text-sm ${
                      errors.partQty ? "border-red-500" : "border-slate-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removePartRow(idx)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {errors.partQty && (
              <p className="text-red-400 text-sm mt-2">{errors.partQty}</p>
            )}

            <button
              type="button"
              onClick={addPartRow}
              className="flex items-center mt-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md px-3 py-2 text-sm transition-colors duration-200 shadow-lg border border-purple-500 hover:border-purple-400"
            >
              <Plus size={16} className="mr-2" />
              Add Part
            </button>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <Wrench size={18} className="mr-2" />
              {isSubmitting
                ? "Saving..."
                : editingId
                ? "Update Maintenance"
                : "Add Maintenance"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                <span className="mr-2">❌</span>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {reminders && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold">Reminders</h2>
          </div>

          <div className="bg-slate-700 p-3 rounded-md mb-4 text-sm">
            Window: 7 days / 500 km
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <div className="text-sm font-medium">Due by Date</div>
              </div>
              <ul className="space-y-2">
                <li className="text-sm flex items-center">
                  <span className="mr-2">•</span>
                  <span>tata - croc on 9/10/2025</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <div className="text-sm font-medium">Due by Mileage</div>
              </div>
              <ul>{/* Due by Mileage items would go here */}</ul>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4 shadow-lg">
        <div className="flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vehicle, service type, mechanic or status..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-400">
            Found {filteredRecords.length}{" "}
            {filteredRecords.length === 1 ? "record" : "records"} matching "
            {searchTerm}"
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden mb-6 shadow-lg">
        <table className="w-full text-sm text-white">
          <thead className="bg-slate-700 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Service Type</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-400" colSpan="6">
                  <div className="flex flex-col items-center gap-2">
                    <Wrench className="h-10 w-10 text-gray-500" />
                    <span>
                      {searchTerm
                        ? "No matching records found"
                        : "No maintenance records found"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record._id} className="border-b border-slate-700">
                  <td className="px-4 py-3">{record.vehicleNumber}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-900 text-white px-3 py-0.5 rounded-full text-xs">
                      {record.serviceType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {record.serviceDate
                      ? new Date(record.serviceDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {record.serviceCost ? `$${record.serviceCost}` : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`${
                        record.status === "completed"
                          ? "bg-green-900 text-green-100"
                          : "bg-yellow-700 text-yellow-100"
                      } px-2 py-1 rounded-sm text-xs`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(record)}
                        className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(record._id)}
                        className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        <Trash2 size={14} className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {report && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold">Report</h2>
          </div>
          <div className="text-sm mb-2">
            Total Records: {report.summary?.records || 0} • Total Cost: $
            {report.summary?.totalCost || 0}
          </div>

          <h3 className="text-sm font-medium mb-1">By Service Type:</h3>
          <ul className="text-sm list-disc list-inside">
            {report.byServiceType?.map((item) => (
              <li key={item._id}>
                {item._id}: {item.count} records, ${item.totalCost} cost
              </li>
            ))}
            {(!report.byServiceType || report.byServiceType.length === 0) && (
              <li className="text-gray-400">No service type data available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
