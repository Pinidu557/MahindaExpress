import React, { useState, useEffect } from 'react';
import api from '../lib/api.js';

export default function Attendance() {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [status, setStatus] = useState('Present');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [actionLoading, setActionLoading] = useState({ checkIn: false, checkOut: false });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get('/staff');
        setStaff(response.data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    const fetchRecentAttendance = async () => {
      try {
        const response = await api.get('/staff');
        const allStaff = response.data;
        const recent = [];
        
        allStaff.forEach(staffMember => {
          if (staffMember.attendance && staffMember.attendance.length > 0) {
            const latestRecord = staffMember.attendance[staffMember.attendance.length - 1];
            recent.push({
              staffName: staffMember.name,
              staffRole: staffMember.role,
              date: latestRecord.date,
              status: latestRecord.status
            });
          }
        });
        
        setRecentAttendance(recent.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10));
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchStaff();
    fetchRecentAttendance();
  }, []);

  async function handleMark(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    
    if (!selectedStaff) {
      setMsg('Please select a staff member');
      setLoading(false);
      return;
    }
    
    try {
      await api.put(`/staff/attendance/${selectedStaff}`, { status });
      setMsg('✅ Attendance marked successfully');
      setSelectedStaff('');
      setStatus('Present');
      
      // Refresh recent attendance
      const response = await api.get('/staff');
      const allStaff = response.data;
      const recent = [];
      
      allStaff.forEach(staffMember => {
        if (staffMember.attendance && staffMember.attendance.length > 0) {
          const latestRecord = staffMember.attendance[staffMember.attendance.length - 1];
          recent.push({
            staffName: staffMember.name,
            staffRole: staffMember.role,
            date: latestRecord.date,
            status: latestRecord.status
          });
        }
      });
      
      setRecentAttendance(recent.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10));
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    setMsg('');
    if (!selectedStaff) {
      setMsg('Please select a staff member');
      return;
    }
    try {
      setActionLoading((s) => ({ ...s, checkIn: true }));
      const res = await api.put(`/staff/checkin/${selectedStaff}`);
      setMsg('✅ Checked in successfully');
      // Refresh recent attendance
      const response = await api.get('/staff');
      const allStaff = response.data;
      const recent = [];
      allStaff.forEach(staffMember => {
        if (staffMember.attendance && staffMember.attendance.length > 0) {
          const latestRecord = staffMember.attendance[staffMember.attendance.length - 1];
          recent.push({
            staffName: staffMember.name,
            staffRole: staffMember.role,
            date: latestRecord.date,
            status: latestRecord.status
          });
        }
      });
      setRecentAttendance(recent.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10));
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || 'Failed to check in');
    } finally {
      setActionLoading((s) => ({ ...s, checkIn: false }));
    }
  }

  async function handleCheckOut() {
    setMsg('');
    if (!selectedStaff) {
      setMsg('Please select a staff member');
      return;
    }
    try {
      setActionLoading((s) => ({ ...s, checkOut: true }));
      const res = await api.put(`/staff/checkout/${selectedStaff}`);
      setMsg('✅ Checked out successfully');
      // Refresh recent attendance
      const response = await api.get('/staff');
      const allStaff = response.data;
      const recent = [];
      allStaff.forEach(staffMember => {
        if (staffMember.attendance && staffMember.attendance.length > 0) {
          const latestRecord = staffMember.attendance[staffMember.attendance.length - 1];
          recent.push({
            staffName: staffMember.name,
            staffRole: staffMember.role,
            date: latestRecord.date,
            status: latestRecord.status
          });
        }
      });
      setRecentAttendance(recent.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10));
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || 'Failed to check out');
    } finally {
      setActionLoading((s) => ({ ...s, checkOut: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Mark Attendance Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Mark Attendance</h2>
          <p className="text-slate-400">Record attendance for staff members</p>
        </div>

        <form onSubmit={handleMark} className="space-y-6">
          {msg && (
            <div className={`p-4 rounded-lg ${
              msg.includes('✅') 
                ? 'bg-green-900 border border-green-700 text-green-200' 
                : 'bg-red-900 border border-red-700 text-red-200'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">{msg.includes('✅') ? '✅' : '⚠️'}</span>
                <p>{msg}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Staff Member *</label>
              <select 
                value={selectedStaff} 
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a staff member</option>
                {staff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Attendance Status *</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading.checkIn || loading || !selectedStaff}
                className="bg-slate-600 hover:bg-slate-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded"
              >
                {actionLoading.checkIn ? 'Checking in...' : 'Check In'}
              </button>
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading.checkOut || loading || !selectedStaff}
                className="bg-slate-600 hover:bg-slate-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded"
              >
                {actionLoading.checkOut ? 'Checking out...' : 'Check Out'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedStaff('');
                setStatus('Present');
                setMsg('');
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded"
            >
              Clear Form
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Marking...
                </>
              ) : (
                <>
                  <span className="mr-2">📝</span>
                  Mark Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Attendance Records */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Recent Attendance</h2>
          <p className="text-slate-400">Latest attendance records</p>
        </div>

        {recentAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recentAttendance.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-700 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {record.staffName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-200">{record.staffName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-200">{record.staffRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-200">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(record.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'Present' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-4xl text-slate-400">📅</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">No attendance records</h3>
            <p className="text-slate-400">Start marking attendance to see records here</p>
          </div>
        )}
      </div>
    </div>
  );
}

