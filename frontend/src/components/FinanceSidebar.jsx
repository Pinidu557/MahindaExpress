import React from "react";
import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth"; // Assuming finance pages are also admin-protected

// Import heroicons for vectors (make sure you have them installed)
// If you don't have heroicons installed, run: npm install @heroicons/react
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  WalletIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const FinanceSidebar = () => {
  const { adminData, logout } = useAdminAuth();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <aside className="w-64 bg-slate-800 text-white p-4 space-y-4 flex flex-col h-screen fixed top-0 left-0">
      {/* Title */}
      <div className="text-xl font-bold text-blue-400 mb-4 border-b border-blue-700 pb-3">
        Finance Management
      </div>

      {/* Admin Info */}
      {adminData && (
        <div className="bg-slate-700 p-3 rounded-lg mb-4">
          <p className="text-sm text-slate-300">Welcome,</p>
          <p className="font-semibold">{adminData.name}</p>
          <p className="text-xs text-slate-400">{adminData.email}</p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="space-y-2 flex-1">
        <NavLink
          to="/finance-dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700"
            }`
          }
        >
          <ChartBarIcon className="h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/finance/budgets"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700"
            }`
          }
        >
          <WalletIcon className="h-5 w-5" />
          Budgets
        </NavLink>
        <NavLink
          to="/finance/payroll"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700"
            }`
          }
        >
          <CurrencyDollarIcon className="h-5 w-5" />
          PayRoll
        </NavLink>
        {/* <NavLink
          to="/finance/loans"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700"
            }`
          }
        >
          <DocumentTextIcon className="h-5 w-5" />
          Loans
        </NavLink> */}
        <NavLink
          to="/finance/advance"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700"
            }`
          }
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Advance
        </NavLink>
      </nav>

      {/* Logout & Main Dashboard Buttons at the bottom */}
      <div className="pt-4 border-t border-slate-700 space-y-2">
        {adminData && (
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left rounded hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        )}
        <NavLink
          to="/dashboard" // This navigates to the Passenger Dashboard as per your App.jsx
          className="w-full px-3 py-2 text-left rounded bg-purple-700 hover:bg-purple-800 transition-colors duration-200 flex items-center gap-2 text-white font-semibold"
        >
          <HomeIcon className="h-5 w-5" />
          Main Dashboard
        </NavLink>
      </div>
    </aside>
  );
};

export default FinanceSidebar;