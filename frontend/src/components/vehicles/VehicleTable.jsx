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

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Vehicles</h2>
        <div className="space-x-2">
          <Button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          >
            Add Vehicle
          </Button>

          <Button variant="success" onClick={handleGenerateReport}>
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
              <th className="py-2 px-4 text-left">Vehicle Status</th>
              <th className="py-2 px-4 text-left">Assigned Route</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle._id}
                className="border-b border-slate-600 hover:bg-slate-700"
              >
                <td className="py-2 px-4">{vehicle.plateNumber}</td>
                <td className="py-2 px-4">{vehicle.vehicleType}</td>
                <td className="py-2 px-4">{vehicle.model}</td>
                <td className="py-2 px-4">{vehicle.capacity}</td>
                <td className="py-2 px-4">{vehicle.routeStatus}</td>
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
            ))}
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
