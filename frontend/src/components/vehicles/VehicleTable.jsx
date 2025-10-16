import { useEffect, useState } from "react";
import { getAllVehicles, deleteVehicle } from "../../services/vehicleServices";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import VehicleForm from "./VehicleForm";

//import jsPDF and autoTable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const response = await getAllVehicles();
      setVehicles(response.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Delete vehicle
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;
    try {
      await deleteVehicle(id);
      fetchVehicles();
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  //function for generating PDF
  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vehicle Report", 14, 20);

    //prepare table rows
    const tableColumn = [
      "Plate Number",
      "Type",
      "Model",
      "Capacity",
      "Mileage (km)",
      "Year",
      "Vehicle Status",
      "Assigned Route",
    ];

    const tableRows = vehicles.map((v) => [
      v.plateNumber,
      v.vehicleType,
      v.model,
      v.capacity,
      v.mileage,
      v.year,
      v.vehicleStatus,
      v.assignedRouteId
        ? `${v.assignedRouteId.routeNumber} - ${v.assignedRouteId.startLocation} - ${v.assignedRouteId.endLocation}`
        : "-",
    ]);

    //Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        overflow: "linebreak", // ✅ prevents text cutoff
        cellWidth: "wrap",
        fontSize: 10,
      },
      columnStyles: {
        7: { cellWidth: 60 }, // Assigned Route column wider
      },
    });
    doc.save("vehicle_report.pdf");
  };

  // Filter vehicles based on search term and filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      vehicle.plateNumber?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleType?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleStatus?.toLowerCase().includes(searchLower) ||
      vehicle.assignedRouteId?.routeNumber?.toLowerCase().includes(searchLower)
    );

    const matchesStatus = filterStatus === "all" || vehicle.vehicleStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-white">Vehicles</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter by Vehicle Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          >
            Add Vehicle
          </Button>

          <Button 
            variant="report" 
            onClick={handleGenerateReport}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer" 
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-700 text-white rounded-lg">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="py-2 px-4 text-left">Plate Number</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Model</th>
              <th className="py-2 px-4 text-left">Capacity</th>
              <th className="py-2 px-4 text-left">Mileage (km)</th>
              <th className="py-2 px-4 text-left">Year</th>
              <th className="py-2 px-4 text-left">Vehicle Status</th>
              <th className="py-2 px-4 text-left">Assigned Route</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-400">
                  {searchTerm ? "No vehicles found matching your search" : "No vehicles available"}
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle._id}
                  className="border-b border-slate-600 hover:bg-slate-700"
                >
                <td className="py-2 px-4">{vehicle.plateNumber}</td>
                <td className="py-2 px-4">{vehicle.vehicleType}</td>
                <td className="py-2 px-4">{vehicle.model}</td>
                <td className="py-2 px-4">{vehicle.capacity}</td>
                <td className="py-2 px-4">{vehicle.mileage}</td>
                <td className="py-2 px-4">{vehicle.year}</td>
                <td className="py-2 px-4">{vehicle.vehicleStatus}</td>
                <td className="py-2 px-4">
                  {vehicle.assignedRouteId
                    ? `${vehicle.assignedRouteId.routeNumber} - ${vehicle.assignedRouteId.startLocation} → ${vehicle.assignedRouteId.endLocation}`
                    : "-"}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <Button
                    onClick={() => {
                      setEditData(vehicle);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editData ? "Edit Vehicle" : "Add Vehicle"}
      >
        <VehicleForm
          existingData={editData}
          onSuccess={fetchVehicles}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
