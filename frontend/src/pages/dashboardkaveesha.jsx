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
          animation: fadeIn 0.6s ease-in-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
          opacity: 0;
          transform: scale(0.9);
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        .hover-lift:hover {
          transform: translateY(-3px);
          transition: all 0.3s ease;
        }
        .hover-glow:hover {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          border-color: #4b5563;
        }
        .card {
          background: #0f172a; /* slate-800 - slightly lighter than bg-slate-900 */
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid #1e293b; /* slate-700 */
        }
        .btn-primary {
          background: #6366f1; /* indigo-500 */
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          background: #4f46e5; /* indigo-600 */
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        .btn-secondary {
          background-color: #4b5563; /* gray-600 */
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .btn-secondary:hover {
          background-color: #374151; /* gray-700 */
          transform: translateY(-1px);
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

      <h1 className="text-3xl font-bold text-white animate-fadeIn">
        Maintenance & Service Tracking
      </h1>

      <div className="grid grid-cols-4 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="card hover-lift animate-scaleIn">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Upcoming Reminders
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
            {reminders.dueByDate.slice(0, 3).map((r, index) => (
              <li
                key={r._id}
                className="animate-slideIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {`Service ${r.serviceType} due for ${r.vehicleNumber} on ${
                  r.nextServiceDate
                    ? new Date(r.nextServiceDate).toLocaleDateString()
                    : "soon"
                }`}
              </li>
            ))}
            {reminders.dueByMileage.slice(0, 3).map((r, index) => (
              <li
                key={r._id}
                className="animate-slideIn"
                style={{
                  animationDelay: `${
                    (index + reminders.dueByDate.length) * 0.1
                  }s`,
                }}
              >
                {`Service ${r.serviceType} due for ${r.vehicleNumber} at ${r.nextServiceMileage} km`}
              </li>
            ))}
            {reminders.dueByDate.length === 0 &&
              reminders.dueByMileage.length === 0 && (
                <li className="text-gray-400 italic">
                  Nothing due in the selected window
                </li>
              )}
          </ul>
        </div>
        <div className="card hover-lift animate-scaleIn">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              to="/maintenance"
              className="btn-primary w-fit flex items-center gap-2 hover-glow"
            >
              <span className="text-lg">+</span>
              Add Maintenance Record
            </Link>
            <Link
              to="/reports"
              className="btn-secondary w-fit flex items-center gap-2"
            >
              <span className="text-lg">📊</span>
              Generate Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, color, delay = "0s" }) => (
  <div
    className={`rounded-lg p-4 shadow-lg hover-lift animate-scaleIn bg-slate-800 border border-slate-700`}
    style={{ animationDelay: delay }}
  >
    <div className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-200">
      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
      {title}
    </div>
    <div
      className={`text-2xl font-bold animate-fadeIn ${
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
