import React, { useState, useEffect } from "react";
import api from "../lib/api.js";
import DashboardStats from "../components/DashboardStats.jsx";

function DashboardHirun() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    totalBuses: 0,
  });
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/staff");
        const staffData = response.data;

        setStaff(staffData);
        setStats({
          totalStaff: staffData.length,
          presentToday: staffData.filter((s) => s.attendance === "present")
            .length,
          totalBuses: new Set(
            staffData.map((s) => s.assignedBus).filter(Boolean)
          ).size,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-slate-900 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-200 mb-4">
            Dashboard Overview
          </h1>
          <p className="text-lg text-slate-400">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-slate-900 min-h-screen">
      {/* Dashboard Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-200 mb-4">
          Dashboard Overview
        </h1>
        <p className="text-lg text-slate-400">
          Real-time insights into your staff management system
        </p>
      </div>

      {/* Dashboard Stats with Enhanced Layout */}
      <div className="space-y-8">
        {/* Primary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200 mb-2">
                  Total Staff
                </p>
                <p className="text-4xl font-bold text-white">
                  {stats.totalStaff}
                </p>
                <p className="text-xs text-blue-300 mt-1">Active employees</p>
              </div>
              <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-200 mb-2">
                  Present Today
                </p>
                <p className="text-4xl font-bold text-white">
                  {stats.presentToday}
                </p>
                <p className="text-xs text-green-300 mt-1">Currently working</p>
              </div>
              <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>


          <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200 mb-2">
                  Active Buses
                </p>
                <p className="text-4xl font-bold text-white">
                  {stats.totalBuses}
                </p>
                <p className="text-xs text-purple-300 mt-1">
                  Assigned vehicles
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 border border-cyan-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-200 mb-2">
                  Overtime Hours
                </p>
                <p className="text-3xl font-bold text-white">
                  {(stats.otHours || 0).toFixed(1)}h
                </p>
                <p className="text-xs text-cyan-300 mt-1">Total this month</p>
              </div>
              <div className="w-14 h-14 bg-cyan-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-200 mb-2">
                  No-pay Leaves
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats.noPayLeaves}
                </p>
                <p className="text-xs text-red-300 mt-1">Unpaid absences</p>
              </div>
              <div className="w-14 h-14 bg-red-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-slate-200 mb-6">
          Quick Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Attendance Rate
            </h3>
            <p className="text-3xl font-bold text-blue-400">
              {stats.totalStaff > 0
                ? ((stats.presentToday / stats.totalStaff) * 100).toFixed(1)
                : 0}
              %
            </p>
            <p className="text-sm text-slate-400 mt-1">Today's performance</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚌</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Bus Utilization
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {stats.totalStaff > 0
                ? ((stats.totalBuses / stats.totalStaff) * 100).toFixed(1)
                : 0}
              %
            </p>
            <p className="text-sm text-slate-400 mt-1">Fleet efficiency</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Avg OT per Staff
            </h3>
            <p className="text-3xl font-bold text-purple-400">
              {stats.totalStaff > 0
                ? ((stats.otHours || 0) / stats.totalStaff).toFixed(1)
                : 0}
              h
            </p>
            <p className="text-sm text-slate-400 mt-1">Overtime distribution</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHirun;
