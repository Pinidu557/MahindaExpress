import React, { useState, useEffect } from 'react';
import api from '../lib/api.js';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    totalBuses: 0,
    otHours: 0,
    noPayLeaves: 0,
    maintenanceCompletedThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch staff data
        const response = await api.get('/staff');
        const staffData = response.data;
        
        // Calculate today's attendance
        const today = new Date().toDateString();
        const presentToday = staffData.filter(staff => 
          staff.attendance && staff.attendance.some(record => 
            new Date(record.date).toDateString() === today && record.status === 'Present'
          )
        ).length;

        // Calculate unique buses
        const uniqueBuses = new Set(staffData.map(s => s.assignedBus).filter(Boolean));
        
        // Calculate No-pay leaves (all-time Absent entries)
        const noPayLeaves = staffData.reduce((sum, s) => {
          const absents = (s.attendance || []).filter(r => r.status === 'Absent').length;
          return sum + absents;
        }, 0);
        
        // Calculate OT hours (placeholder until backend provides data)
        // If a field like s.otHours exists, sum it; otherwise stays 0
        const otHours = staffData.reduce((sum, s) => {
          const value = Number(s.otHours || 0);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        // Fetch maintenance data for completed maintenance this month
        let maintenanceCompletedThisMonth = 0;
        try {
          const maintenanceResponse = await api.get('/maintenance');
          const maintenanceData = maintenanceResponse.data;
          
          // Get current month and year
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();
          
          // Filter maintenance records that are completed in the current month
          maintenanceCompletedThisMonth = maintenanceData.filter(
            record => 
              record.status === "completed" &&
              record.serviceDate &&
              new Date(record.serviceDate).getMonth() === month &&
              new Date(record.serviceDate).getFullYear() === year
          ).length;
        } catch (maintError) {
          console.error('Error fetching maintenance data:', maintError);
          // Continue with other stats even if maintenance data fails
        }
        
        setStats({
          totalStaff: staffData.length,
          presentToday: presentToday,
          totalBuses: uniqueBuses.size,
          otHours,
          noPayLeaves,
          maintenanceCompletedThisMonth
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-slate-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Staff',
      value: stats.totalStaff,
      icon: '👥',
      color: 'primary',
      bgColor: 'bg-blue-900',
      textColor: 'text-blue-400'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: '✅',
      color: 'success',
      bgColor: 'bg-green-900',
      textColor: 'text-green-400'
    },
    {
      title: 'Active Buses',
      value: stats.totalBuses,
      icon: '🚌',
      color: 'accent',
      bgColor: 'bg-purple-900',
      textColor: 'text-purple-400'
    },
    {
      title: 'Maintenance Completed',
      value: stats.maintenanceCompletedThisMonth,
      icon: '🔧',
      color: 'info',
      bgColor: 'bg-green-800',
      textColor: 'text-green-400'
    },
    {
      title: 'OT Hours',
      value: stats.otHours,
      icon: '⏱️',
      color: 'info',
      bgColor: 'bg-cyan-900',
      textColor: 'text-cyan-400'
    },
    {
      title: 'No-pay Leaves',
      value: stats.noPayLeaves,
      icon: '❌',
      color: 'danger',
      bgColor: 'bg-red-900',
      textColor: 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}