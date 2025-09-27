import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';

export default function StaffList({ refreshKey }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingOt, setAddingOt] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get('/staff');
        if (!cancelled) setRows(res.data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id) {
    if (!confirm('Delete this staff member?')) return;
    try {
      setDeleting(id);
      await api.delete(`/staff/${id}`);
      setRows((r) => r.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Delete failed');
    } finally {
      setDeleting('');
    }
  }

  async function handleAddOt(id) {
    const input = prompt('Enter OT hours to add (e.g., 1.5):');
    if (input == null) return;
    const hours = Number(input);
    if (isNaN(hours) || hours < 0) {
      alert('Please enter a valid non-negative number');
      return;
    }
    try {
      setAddingOt(id);
      const res = await api.put(`/staff/overtime/${id}`, { hours });
      const updated = res.data?.staff || null;
      setRows((r) => r.map((x) => (x._id === id ? { ...x, otHours: updated?.otHours ?? (x.otHours || 0) + hours } : x)));
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to add OT');
    } finally {
      setAddingOt('');
    }
  }

  const filteredRows = rows.filter(row =>
    row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.assignedBus && row.assignedBus.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-slate-400">Loading staff members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900 rounded-full flex items-center justify-center">
            <span className="text-2xl text-red-400">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Error Loading Staff</h3>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Staff Members</h2>
          <p className="text-slate-400">Manage your team members and their details</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/staff/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm inline-flex items-center"
            >
              <span className="mr-2">➕</span>
              Add Staff
            </button>
            <button
              onClick={() => navigate('/staff/assign')}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded text-sm inline-flex items-center"
            >
              <span className="mr-2">🚌</span>
              Assign Buses
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded px-3 py-2 pl-10 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-4xl text-slate-400">👥</span>
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No staff members found</h3>
          <p className="text-slate-400">Start by adding your first team member</p>
        </div>
      ) : (
        <div className="overflow-hidden">
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
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Assigned Bus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    OT Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-700 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {row.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-200">{row.name || 'Unknown'}</div>
                          <div className="text-sm text-slate-400">ID: {row._id?.slice(-6) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-200">{row.role || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-200">{row.email || 'No email'}</div>
                      <div className="text-sm text-slate-400">{row.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {row.assignedBus ? (
                        <div className="flex items-center">
                          <span className="text-sm text-slate-200 bg-blue-900 text-blue-200 px-2 py-1 rounded-full">
                            🚌 {row.assignedBus}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-200">{Number(row.otHours || 0).toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddOt(row._id)}
                          disabled={addingOt === row._id}
                          className="bg-slate-600 hover:bg-slate-700 disabled:bg-gray-500 text-white font-medium py-1 px-3 rounded text-sm"
                        >
                          {addingOt === row._id ? 'Adding OT...' : '➕ OT'}
                        </button>
                        <button
                           onClick={() => navigate(`/staff/edit/${row._id}`)}
                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                          >
                                  ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row._id)}
                          disabled={deleting === row._id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-medium py-1 px-3 rounded text-sm inline-flex items-center"
                        >
                          {deleting === row._id ? (
                            <>
                              <div className="spinner mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            '🗑️ Delete'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRows.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-slate-400">No staff members found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

