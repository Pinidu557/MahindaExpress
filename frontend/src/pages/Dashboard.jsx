import React, { useEffect, useState } from "react";
import { vehiclesApi, maintenanceApi } from "../api/client";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [stats, setStats] = useState({ vehicles: 0, pending: 0, completedThisMonth: 0, totalCost: 0 });
  const [reminders, setReminders] = useState({ dueByDate: [], dueByMileage: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [vs, maint, report, rmd] = await Promise.all([
          vehiclesApi.list(),
          maintenanceApi.list(),
          maintenanceApi.report({}),
          maintenanceApi.reminders({ days: 7, km: 500 })
        ]);
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const completedThisMonth = maint.filter(r => r.status === "completed" && r.serviceDate && new Date(r.serviceDate).getMonth() === month && new Date(r.serviceDate).getFullYear() === year).length;
        const pending = maint.filter(r => r.status === "pending").length;
        setStats({
          vehicles: vs.length,
          pending,
          completedThisMonth,
          totalCost: report?.summary?.totalCost || 0
        });
        setReminders({ dueByDate: rmd.dueByDate || [], dueByMileage: rmd.dueByMileage || [] });
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
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


      <h1 className="text-2xl font-semibold animate-fadeIn">Maintenance & Service Tracking</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value={stats.vehicles} color="bg-blue-100 text-blue-700" delay="0.1s" />
        <StatCard title="Pending Maintenance" value={stats.pending} color="bg-yellow-100 text-yellow-700" delay="0.2s" />
        <StatCard title="Completed This Month" value={stats.completedThisMonth} color="bg-green-100 text-green-700" delay="0.3s" />
        <StatCard title="Total Maintenance Cost" value={`$${stats.totalCost}`} color="bg-rose-100 text-rose-700" delay="0.4s" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card hover-lift animate-scaleIn">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Upcoming Reminders
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {reminders.dueByDate.slice(0,3).map((r, index) => (
              <li key={r._id} className="animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                {`Service ${r.serviceType} due for ${r.vehicleNumber} on ${r.nextServiceDate ? new Date(r.nextServiceDate).toLocaleDateString() : "soon"}`}
              </li>
            ))}
            {reminders.dueByMileage.slice(0,3).map((r, index) => (
              <li key={r._id} className="animate-slideIn" style={{animationDelay: `${(index + reminders.dueByDate.length) * 0.1}s`}}>
                {`Service ${r.serviceType} due for ${r.vehicleNumber} at ${r.nextServiceMileage} km`}
              </li>
            ))}
            {reminders.dueByDate.length === 0 && reminders.dueByMileage.length === 0 && (
              <li className="text-gray-500 italic">Nothing due in the selected window</li>
            )}
          </ul>
        </div>
        <div className="card hover-lift animate-scaleIn">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
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
    className={`rounded-lg p-4 ${color} shadow-sm hover-lift animate-scaleIn`}
    style={{animationDelay: delay}}
  >
    <div className="text-sm font-medium mb-2 flex items-center gap-2">
      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
      {title}
    </div>
    <div className="text-2xl font-bold animate-fadeIn">{value}</div>
  </div>
);


