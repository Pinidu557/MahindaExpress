import React, { useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

export default function AppSidebar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/dashboardhirun', label: 'Dashboard', icon: '📊', description: 'Overview & Analytics' },
    { path: '/staff/create', label: 'Add Staff', icon: '➕', description: 'Create New Staff' },
    { path: '/staff/list', label: 'Staff List', icon: '📋', description: 'View All Staff' },
    { path: '/staff/profile', label: 'Staff Profile', icon: '👤', description: 'Staff Details' },
    { path: '/staff/assign', label: 'Assign Staff', icon: '🚌', description: 'Assign to Buses' },
    { path: '/attendance', label: 'Attendance', icon: '📅', description: 'Track Attendance' },
    { path: '/payroll', label: 'Payroll', icon: '💰', description: 'Salary Management' }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm"
        >
          <span className="mr-2">☰</span>
          Menu
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Desktop Sidebar */}
      <div className="w-72 bg-slate-800 border-r border-slate-700 min-h-screen p-6 slide-in hidden lg:block">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">ME</span>
          </div>
          <h1 className="text-xl font-bold text-slate-200 mb-1">Mahinda Express</h1>
          <p className="text-sm text-slate-400">Staff Management System</p>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-2xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {item.label}
                  </div>
                  <div className="text-xs opacity-75">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Main Dashboard Button */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <Link
            to="/dashboard"
            className="flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 text-slate-300 hover:bg-slate-700 hover:text-white group"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform">
              🏠
            </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  Main Dashboard
                </div>
                <div className="text-xs opacity-75">
                  Back to Main System
                </div>
              </div>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 w-80 h-full bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">ME</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-200">Mahinda Express</h1>
                <p className="text-xs text-slate-400">Staff Management</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded text-sm"
            >
              ✕
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-xl">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {item.label}
                    </div>
                    <div className="text-xs opacity-75">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Main Dashboard Button */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 text-slate-300 hover:bg-slate-700 hover:text-white group"
            >
              <div className="text-xl group-hover:scale-110 transition-transform">
                🏠
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  Main Dashboard
                </div>
                <div className="text-xs opacity-75">
                  Back to Main System
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}


