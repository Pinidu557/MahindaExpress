import React from 'react';
import AssignStaff from '../components/AssignStaff.jsx';
import QuickNav from '../components/QuickNav.jsx';

export default function AssignStaffPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Assign Staff to Buses</h1>
        <p className="text-gray-600">Assign staff members to specific buses and routes</p>
      </div>

      <QuickNav />

      <div className="max-w-4xl mx-auto">
        <AssignStaff />
      </div>
    </div>
  );
}

