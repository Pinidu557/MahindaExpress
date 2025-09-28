import React from 'react';
import StaffProfile from '../components/StaffProfile.jsx';
import QuickNav from '../components/QuickNav.jsx';

export default function StaffProfilePage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-200 mb-2">Staff Profiles</h1>
        <p className="text-slate-400">View detailed information about your staff members</p>
      </div>

      <QuickNav />

      <div className="max-w-6xl mx-auto">
        <StaffProfile />
      </div>
    </div>
  );
}

