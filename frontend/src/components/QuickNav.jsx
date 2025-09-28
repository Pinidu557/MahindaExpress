import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickNav() {
  const navigate = useNavigate();

  const quickNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/staff/create', label: 'Add Staff', icon: '➕' },
    { path: '/staff/list', label: 'Staff List', icon: '📋' },
    { path: '/staff/assign', label: 'Assign Buses', icon: '🚌' },
    { path: '/attendance', label: 'Attendance', icon: '📅' },
    { path: '/payroll', label: 'Payroll', icon: '💰' }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-3">Quick Navigation</h3>
      <div className="flex flex-wrap gap-2">
        {quickNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 text-sm font-medium text-slate-200"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


