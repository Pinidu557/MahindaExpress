import { useEffect, useState } from "react";
import { getAllRoutes, deleteRoute } from "../../services/routeService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import RouteForm from "./RouteForm";

//import jsPDF and autoTable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RouteTable() {
  const [routes, setRoutes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("routeNumber");

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      const response = await getAllRoutes();
      setRoutes(response.data); // axios returns data in response.data
    } catch (err) {
      console.error("Error fetching routes:", err);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Delete a route
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await deleteRoute(id);
      fetchRoutes();
    } catch (err) {
      console.error("Error deleting route:", err);
    }
  };

  // function to generate PDF
  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bus Route Report", 14, 20);

    //prepare table rows
    const tableColumn = [
      "Route Number",
      "Start",
      "End",
      "Distance (km)",
      "Est. Time",
      "Fare",
    ];
    const tableRows = routes.map((r) => [
      r.routeNumber,
      r.startLocation,
      r.endLocation,
      r.distance,
      r.estimatedTime,
      r.fare,
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
    doc.save("route_report.pdf");
  };

  // Filter and sort routes based on search term and sort option
  const filteredRoutes = routes
    .filter((route) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        route.routeNumber?.toLowerCase().includes(searchLower) ||
        route.startLocation?.toLowerCase().includes(searchLower) ||
        route.endLocation?.toLowerCase().includes(searchLower) ||
        route.estimatedTime?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "routeNumber":
          return a.routeNumber?.localeCompare(b.routeNumber) || 0;
        case "distance":
          return (a.distance || 0) - (b.distance || 0);
        case "fare":
          return (a.fare || 0) - (b.fare || 0);
        case "startLocation":
          return a.startLocation?.localeCompare(b.startLocation) || 0;
        default:
          return 0;
      }
    });

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-white">Routes</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search routes"
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
          
          {/* Sort By Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="routeNumber">Sort by Route Number</option>
            <option value="startLocation">Sort by Start Location</option>
            <option value="distance">Sort by Distance</option>
            <option value="fare">Sort by Fare</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          >
            Add Route
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
              <th className="py-2 px-4 text-left">Route Number</th>
              <th className="py-2 px-4 text-left">Start</th>
              <th className="py-2 px-4 text-left">End</th>
              <th className="py-2 px-4 text-left">Distance (km)</th>
              <th className="py-2 px-4 text-left">Est. Time</th>
              <th className="py-2 px-4 text-left">Fare</th>

              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  {searchTerm ? "No routes found matching your search" : "No routes available"}
                </td>
              </tr>
            ) : (
              filteredRoutes.map((route) => (
                <tr
                  key={route._id}
                  className="border-b border-slate-600 hover:bg-slate-700"
                >
                <td className="py-2 px-4">{route.routeNumber}</td>
                <td className="py-2 px-4">{route.startLocation}</td>
                <td className="py-2 px-4">{route.endLocation}</td>
                <td className="py-2 px-4">{route.distance}</td>
                <td className="py-2 px-4">{route.estimatedTime}</td>
                <td className="py-2 px-4">{route.fare}</td>

                <td className="py-2 px-4 space-x-2">
                  <Button
                    onClick={() => {
                      setEditData(route);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(route._id)}
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
        title={editData ? "Edit Route" : "Add Route"}
      >
        <RouteForm
          existingData={editData}
          onSuccess={fetchRoutes}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
