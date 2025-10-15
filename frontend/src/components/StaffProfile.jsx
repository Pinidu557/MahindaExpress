import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';

export default function StaffProfile() {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [payrollErrors, setPayrollErrors] = useState({});

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await api.get('/staff');
        setStaff(response.data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleStaffSelect = (staffMember) => {
    setSelectedStaff(staffMember);
    setPayrollErrors({}); // Clear errors when switching staff
  };

  // Prevent invalid characters from being typed in payroll number fields
  const handlePayrollNumberKeyDown = (e, fieldName) => {
    // Allow: numbers, decimal point, backspace, delete, arrow keys, tab
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Home', 'End', 'Enter'
    ];
    
    // Check if it's an allowed special key
    if (allowedKeys.includes(e.key)) {
      return; // Allow these keys
    }
    
    // Check if it's a number (0-9)
    if (/^[0-9]$/.test(e.key)) {
      return; // Allow numbers
    }
    
    // Check if it's a decimal point (only allow one)
    if (e.key === '.' && !e.target.value.includes('.')) {
      return; // Allow decimal point if not already present
    }
    
    // Block everything else and show error message
    e.preventDefault();
    setPayrollErrors((prev) => ({ ...prev, [fieldName]: "Only numbers and decimal point are allowed" }));
    
    // Clear error after 3 seconds
    setTimeout(() => {
      setPayrollErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }, 3000);
  };

  // Handle payroll number input change
  const handlePayrollNumberInput = (e, fieldName) => {
    const value = e.target.value;
    setSelectedStaff({ ...selectedStaff, [fieldName]: Number(value) || 0 });
    
    // Clear error if user is typing valid characters
    if (payrollErrors[fieldName] && /^[0-9]*\.?[0-9]*$/.test(value)) {
      setPayrollErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-slate-400">Loading staff profiles...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Staff Profile</h2>
            <p className="text-slate-400">Select a staff member to view their profile</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/staff/list')}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded text-sm inline-flex items-center"
            >
              <span className="mr-2">📋</span>
              Staff List
            </button>
            <button
              onClick={() => navigate('/staff/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm inline-flex items-center"
            >
              <span className="mr-2">➕</span>
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Staff Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Select Staff Member</label>
        <select 
          className="bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const staffId = e.target.value;
            const staffMember = staff.find(s => s._id === staffId);
            setSelectedStaff(staffMember || null);
          }}
          value={selectedStaff?._id || ''}
        >
          <option value="">Choose a staff member</option>
          {staff.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.role})
            </option>
          ))}
        </select>
      </div>

      {selectedStaff ? (
        <div>
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-slate-700 p-1 rounded-lg">
            {['Personal Info', 'Attendance', 'Payroll', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-slate-600 text-slate-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'Personal Info' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedStaff.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-200">{selectedStaff.name}</h3>
                  <p className="text-slate-400">{selectedStaff.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Email</div>
                  <div className="font-medium text-slate-200">{selectedStaff.email || 'Not provided'}</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Phone</div>
                  <div className="font-medium text-slate-200">{selectedStaff.phone || 'Not provided'}</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Assigned Bus</div>
                  <div className="font-medium text-slate-200">{selectedStaff.assignedBus || 'Not assigned'}</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Salary</div>
                  <div className="font-medium text-slate-200">${selectedStaff.salary || 0}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Attendance Records</h3>
              {selectedStaff.attendance && selectedStaff.attendance.length > 0 ? (
                <div className="space-y-2">
                  {selectedStaff.attendance.slice(-10).map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-200">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-400">
                          {new Date(record.date).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'Present' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No attendance records found
                </div>
              )}
            </div>
          )}

          {activeTab === 'Payroll' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Payroll Information</h3>
              <div className="bg-slate-700 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Basic Salary</label>
                    <input
                      type="text"
                      value={selectedStaff.basicSalary || 0}
                      onChange={(e) => handlePayrollNumberInput(e, 'basicSalary')}
                      onKeyDown={(e) => handlePayrollNumberKeyDown(e, 'basicSalary')}
                      className={`bg-slate-600 border text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                        payrollErrors.basicSalary ? "border-red-500 focus:ring-red-500" : "border-slate-500 focus:ring-blue-500"
                      }`}
                    />
                    {payrollErrors.basicSalary && (
                      <p className="text-red-400 text-sm mt-1">{payrollErrors.basicSalary}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Allowances</label>
                    <input
                      type="text"
                      value={selectedStaff.allowances || 0}
                      onChange={(e) => handlePayrollNumberInput(e, 'allowances')}
                      onKeyDown={(e) => handlePayrollNumberKeyDown(e, 'allowances')}
                      className={`bg-slate-600 border text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                        payrollErrors.allowances ? "border-red-500 focus:ring-red-500" : "border-slate-500 focus:ring-blue-500"
                      }`}
                    />
                    {payrollErrors.allowances && (
                      <p className="text-red-400 text-sm mt-1">{payrollErrors.allowances}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bonus</label>
                    <input
                      type="text"
                      value={selectedStaff.bonus || 0}
                      onChange={(e) => handlePayrollNumberInput(e, 'bonus')}
                      onKeyDown={(e) => handlePayrollNumberKeyDown(e, 'bonus')}
                      className={`bg-slate-600 border text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                        payrollErrors.bonus ? "border-red-500 focus:ring-red-500" : "border-slate-500 focus:ring-blue-500"
                      }`}
                    />
                    {payrollErrors.bonus && (
                      <p className="text-red-400 text-sm mt-1">{payrollErrors.bonus}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Reimbursements</label>
                    <input
                      type="text"
                      value={selectedStaff.reimbursements || 0}
                      onChange={(e) => handlePayrollNumberInput(e, 'reimbursements')}
                      onKeyDown={(e) => handlePayrollNumberKeyDown(e, 'reimbursements')}
                      className={`bg-slate-600 border text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                        payrollErrors.reimbursements ? "border-red-500 focus:ring-red-500" : "border-slate-500 focus:ring-blue-500"
                      }`}
                    />
                    {payrollErrors.reimbursements && (
                      <p className="text-red-400 text-sm mt-1">{payrollErrors.reimbursements}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Salary Advance</label>
                    <input
                      type="text"
                      value={selectedStaff.salaryAdvance || 0}
                      onChange={(e) => handlePayrollNumberInput(e, 'salaryAdvance')}
                      onKeyDown={(e) => handlePayrollNumberKeyDown(e, 'salaryAdvance')}
                      className={`bg-slate-600 border text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                        payrollErrors.salaryAdvance ? "border-red-500 focus:ring-red-500" : "border-slate-500 focus:ring-blue-500"
                      }`}
                    />
                    {payrollErrors.salaryAdvance && (
                      <p className="text-red-400 text-sm mt-1">{payrollErrors.salaryAdvance}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Loan</label>
                    <input
                      type="text"
                      value={selectedStaff.loan || 0}
                      onChange={(e) => handlePayrollNumberInput(e, 'loan')}
                      onKeyDown={(e) => handlePayrollNumberKeyDown(e, 'loan')}
                      className={`bg-slate-600 border text-slate-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                        payrollErrors.loan ? "border-red-500 focus:ring-red-500" : "border-slate-500 focus:ring-blue-500"
                      }`}
                    />
                    {payrollErrors.loan && (
                      <p className="text-red-400 text-sm mt-1">{payrollErrors.loan}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Net (preview): ${(
                      (Number(selectedStaff.basicSalary || 0) + Number(selectedStaff.allowances || 0) + Number(selectedStaff.bonus || 0) + Number(selectedStaff.reimbursements || 0)) - (Number(selectedStaff.salaryAdvance || 0) + Number(selectedStaff.loan || 0))
                    ).toFixed(2)}
                  </div>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    onClick={async () => {
                      try {
                        const payload = {
                          basicSalary: Number(selectedStaff.basicSalary || 0),
                          allowances: Number(selectedStaff.allowances || 0),
                          bonus: Number(selectedStaff.bonus || 0),
                          reimbursements: Number(selectedStaff.reimbursements || 0),
                          salaryAdvance: Number(selectedStaff.salaryAdvance || 0),
                          loan: Number(selectedStaff.loan || 0),
                        };
                        const res = await api.put(`/staff/${selectedStaff._id}`, payload);
                        setSelectedStaff(res.data);
                      } catch (e) {
                        alert(e.response?.data?.message || e.message || 'Failed to save payroll');
                      }
                    }}
                  >
                    Save Payroll
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Reports' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Staff Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedStaff.attendance?.length || 0}
                  </div>
                  <div className="text-sm text-blue-300">Total Attendance</div>
                </div>
                <div className="bg-green-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {selectedStaff.attendance?.filter(a => a.status === 'Present').length || 0}
                  </div>
                  <div className="text-sm text-green-300">Present Days</div>
                </div>
                <div className="bg-red-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {selectedStaff.attendance?.filter(a => a.status === 'Absent').length || 0}
                  </div>
                  <div className="text-sm text-red-300">Absent Days</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-4xl text-slate-400">👤</span>
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No staff member selected</h3>
          <p className="text-slate-400">Select a staff member from the dropdown to view their profile</p>
        </div>
      )}
    </div>
  );
}

