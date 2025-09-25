import RouteTable from "../components/routes/RouteTable";

export default function RoutesPage() {
  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Routes Management</h1>
      <RouteTable />
    </div>
  );
}
