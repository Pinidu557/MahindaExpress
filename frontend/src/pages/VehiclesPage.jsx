import VehicleTable from "../components/vehicles/VehicleTable";

export default function VehiclesPage() {
  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Vehicles Management
      </h1>
      <VehicleTable />
    </div>
  );
}
