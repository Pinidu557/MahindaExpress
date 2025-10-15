import { Link } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { LogOut, User } from "lucide-react";

const Dashboard = () => {
  const { adminData, logout } = useAdminAuth();

  const handleLogout = async () => {
    
      await logout();
    
  };

  return (
    <div className="bg-slate-900 min-h-screen">
      <header className="p-6 border-b border-blue-800 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        
        {/* Admin Info and Logout */}
        <div className="flex items-center gap-4">
          {adminData && (
            <div className="flex items-center gap-2 text-white">
              <User className="w-5 h-5" />
              <span className="text-sm">
                Welcome, <span className="font-semibold">{adminData.name}</span>
              </span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
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
            to="/finance-dashboard"
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
            to="/dashboardhirun"
            className="p-6 bg-orange-500 text-blue rounded-lg shadow hover:bg-orange-600 transition-colors "
          >
            Staff Management
          </Link>

          <Link
            to="/maintenance"
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
