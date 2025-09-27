import { useEffect, useState } from "react";
import { getAllRoutes, deleteRoute } from "../../services/routeService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import RouteForm from "./RouteForm";

export default function RouteTable() {
  const [routes, setRoutes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Routes</h2>
        <Button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          Add Route
        </Button>
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
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
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
                <td className="py-2 px-4">{route.vehicalStatus}</td>
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
            ))}
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
