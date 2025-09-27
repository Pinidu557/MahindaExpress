import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardHirun from "./page/DashboardHirun.jsx";
import AppSidebar from "./components/AppSidebar.jsx";
import Staff from "./page/StaffPage.jsx";
import CreateStaffPage from "./page/CreateStaffPage.jsx";
import StaffListPage from "./page/StaffListPage.jsx";
import StaffProfilePage from "./page/StaffProfilePage.jsx";
import AssignStaffPage from "./page/AssignStaffPage.jsx";
import AttendancePage from "./page/AttendancePage.jsx";
import PayrollPage from "./page/PayrollPage.jsx";

function App() {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/DashboardHirun" replace />}
            />
            <Route path="/dashboard" element={<DashboardHirun />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/create" element={<CreateStaffPage />} />
            <Route path="/staff/edit/:staffId" element={<CreateStaffPage />} />
            <Route path="/staff/list" element={<StaffListPage />} />
            <Route path="/staff/profile" element={<StaffProfilePage />} />
            <Route path="/staff/assign" element={<AssignStaffPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/payroll" element={<PayrollPage />} />

            <Route
              path="*"
              element={
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-slate-400">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Page Not Found
                  </h2>
                  <p className="text-slate-400">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
