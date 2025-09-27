import React, { useEffect, useState } from "react";
import { vehiclesApi, maintenanceApi } from "../api/client";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    vehicles: 0,
    pending: 0,
    completedThisMonth: 0,
    totalCost: 0,
  });
  const [reminders, setReminders] = useState({
    dueByDate: [],
    dueByMileage: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [vs, maint, report, rmd] = await Promise.all([
          vehiclesApi.list(),
          maintenanceApi.list(),
          maintenanceApi.report({}),
          maintenanceApi.reminders({ days: 7, km: 500 }),
        ]);
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const completedThisMonth = maint.filter(
          (r) =>
            r.status === "completed" &&
            r.serviceDate &&
            new Date(r.serviceDate).getMonth() === month &&
            new Date(r.serviceDate).getFullYear() === year
        ).length;
        const pending = maint.filter((r) => r.status === "pending").length;
        setStats({
          vehicles: vs.length,
          pending,
          completedThisMonth,
          totalCost: report?.summary?.totalCost || 0,
        });
        setReminders({
          dueByDate: rmd.dueByDate || [],
          dueByMileage: rmd.dueByMileage || [],
        });
      } catch {
        // ignore errors for now
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 bg-slate-900 text-white p-6 min-h-screen">
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
          opacity: 0;
          transform: scale(0.95);
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
          opacity: 0;
          transform: translateY(8px);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .card {
          background: #1e293b;
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid #334155;
        }
        .btn-primary {
          background: #6366f1;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);
        }
        .btn-secondary {
          background: #4b5563;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: #374151;
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(75, 85, 99, 0.3);
        }
        .pulse-dot {
          opacity: 0.8;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white">Maintenance Dashboard</h1>
        <p className="text-slate-400 mt-2">
          Monitor your fleet service status and upcoming maintenance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats.vehicles}
          color="text-blue-400"
          delay="0.1s"
        />
        <StatCard
          title="Pending Maintenance"
          value={stats.pending}
          color="text-yellow-400"
          delay="0.2s"
        />
        <StatCard
          title="Completed This Month"
          value={stats.completedThisMonth}
          color="text-green-400"
          delay="0.3s"
        />
        <StatCard
          title="Total Maintenance Cost"
          value={`$${stats.totalCost}`}
          color="text-rose-400"
          delay="0.4s"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Upcoming Reminders
          </h2>
          <ul className="space-y-1 text-sm text-gray-300">
            {reminders.dueByDate.slice(0, 3).map((r) => (
              <li key={r._id} className="flex items-center py-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                {`Service ${r.serviceType} due for ${r.vehicleNumber} on ${
                  r.nextServiceDate
                    ? new Date(r.nextServiceDate).toLocaleDateString()
                    : "soon"
                }`}
              </li>
            ))}
            {reminders.dueByMileage.slice(0, 3).map((r) => (
              <li key={r._id} className="flex items-center py-1">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                {`Service ${r.serviceType} due for ${r.vehicleNumber} at ${r.nextServiceMileage} km`}
              </li>
            ))}
            {reminders.dueByDate.length === 0 &&
              reminders.dueByMileage.length === 0 && (
                <li className="text-gray-400 italic flex items-center py-1">
                  <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                  No maintenance due in the next 7 days / 500 km
                </li>
              )}
          </ul>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2 mt-2">
            <Link
              to="/maintenance"
              className="bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2 w-full py-3 px-4 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium"
            >
              <span>+</span>
              <span>Add Maintenance Record</span>
            </Link>
            <Link
              to="/reports"
              className="bg-gray-600 hover:bg-yellow-600 text-white flex items-center justify-center gap-2 w-full py-3 px-4 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium"
            >
              <span>📊</span>
              <span>Generate Report</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, color }) => (
  <div className={`rounded-lg p-4 bg-slate-800 border border-slate-700`}>
    <div className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
      <div className="w-2 h-2 bg-current rounded-full"></div>
      {title}
    </div>
    <div
      className={`text-2xl font-bold ${
        color.includes("blue")
          ? "text-blue-400"
          : color.includes("yellow")
          ? "text-yellow-400"
          : color.includes("green")
          ? "text-green-400"
          : "text-rose-400"
      }`}
    >
      {value}
    </div>
  </div>
);
