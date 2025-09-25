import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="bg-slate-900 min-h-screen">
      <header className="p-6 border-b border-blue-800">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </header>
      <div className=" flex justify-center p-6">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-screen-2xl mt-50  ">
          <Link
            to="/user-management"
            className="p-6 bg-teal-500 text-blue rounded-lg shadow hover:bg-teal-600 transition-colors "
          >
            User Management
          </Link>

          <Link
            to=""
            className="p-6 bg-yellow-500 text-blue rounded-lg shadow hover:bg-yellow-600 transition-colors"
          >
            Finance Management
          </Link>

          <Link
            to="/routes"
            className="p-6 bg-blue-400 text-blue rounded-lg shadow hover:bg-blue-600 transition-colors"
          >
            Routes Management
          </Link>

          <Link
            to="/vehicles"
            className="p-6 bg-purple-500 text-green rounded-lg shadow hover:bg-purple-600 transition-colors "
          >
            Vehicle Management
          </Link>

          <Link
            to=""
            className="p-6 bg-orange-500 text-blue rounded-lg shadow hover:bg-orange-600 transition-colors "
          >
            Staff Management
          </Link>

          <Link
            to=""
            className="p-6 bg-yellow-500 text-yellow rounded-lg shadow hover:bg-yellow-600 transition-colors"
          >
            Maintenance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
