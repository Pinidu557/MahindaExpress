import React, { useState, useEffect } from 'react';
import api from '../lib/api.js';
import PayrollReport from '../components/PayrollReport';

export default function PayrollPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [payrollData, setPayrollData] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await api.get('/staff');
        setStaff(response.data);
        
        // Calculate payroll data
        const payroll = response.data.map(member => {
          const presentDays = member.attendance?.filter(a => a.status === 'Present').length || 0;
          const totalDays = member.attendance?.length || 0;
          const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
          const baseSalary = Number(member.basicSalary ?? member.salary ?? 0);
          const allowances = Number(member.allowances ?? 0);
          const bonus = Number(member.bonus ?? 0);
          const reimbursements = Number(member.reimbursements ?? 0);
          const salaryAdvance = Number(member.salaryAdvance ?? 0);
          const loan = Number(member.loan ?? 0);
          const otHours = Number(member.otHours ?? 0);
          // Simple OT rate: hourly = base/ (22*8). You can replace with backend value later
          const hourlyRate = baseSalary > 0 ? (baseSalary / (22 * 8)) : 0;
          const otPay = +(otHours * 1.5 * hourlyRate).toFixed(2);
          const gross = baseSalary + allowances + bonus + reimbursements + otPay;
          const deductions = Math.max(0, (totalDays - presentDays) * (baseSalary / 30)) + salaryAdvance + loan; // Daily + advances/loan
          const netPay = Math.max(0, gross - deductions);
          
          return {
            ...member,
            presentDays,
            totalDays,
            attendanceRate,
            baseSalary,
            allowances,
            bonus,
            reimbursements,
            salaryAdvance,
            loan,
            otHours,
            otPay,
            gross,
            deductions,
            netPay
          };
        });
        
        setPayrollData(payroll);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const totalPayroll = payrollData.reduce((sum, member) => sum + member.netPay, 0);
  const totalDeductions = payrollData.reduce((sum, member) => sum + member.deductions, 0);

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-200 mb-2">Payroll Management</h1>
        <p className="text-slate-400">Manage staff salaries and payroll calculations</p>
      </div>

      {/* PayrollReport Component */}
      <PayrollReport employeeId={staff[0]?._id} />

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Staff</p>
              <p className="text-3xl font-bold text-blue-400">{staff.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-green-400">${totalPayroll.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Deductions</p>
              <p className="text-3xl font-bold text-red-400">${totalDeductions.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-200">Payroll Details</h2>
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-slate-300 mb-0">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {payrollData.length > 0 ? (
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
                    Attendance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Allowances</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Bonus</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Reimbursements</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">OT Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">OT Pay</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Advance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Loan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Gross</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {payrollData.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-700 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-200">{member.name}</div>
                          <div className="text-sm text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-200">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-200">
                        {member.presentDays}/{member.totalDays} days
                      </div>
                      <div className="text-sm text-slate-400">
                        {member.attendanceRate.toFixed(1)}% present
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="text-sm font-medium text-slate-200">${member.baseSalary.toLocaleString()}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">${member.allowances.toLocaleString()}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">${member.bonus.toLocaleString()}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">${member.reimbursements.toLocaleString()}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">{member.otHours.toFixed(1)}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">${member.otPay.toLocaleString()}</div></td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-red-400">
                        ${member.deductions.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">${member.salaryAdvance.toLocaleString()}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-slate-200">${member.loan.toLocaleString()}</div></td>
                    <td className="px-6 py-4"><div className="text-sm font-medium text-slate-200">${member.gross.toLocaleString()}</div></td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-green-400">
                        ${member.netPay.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-4xl text-slate-400">💰</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">No payroll data</h3>
            <p className="text-slate-400">Add staff members to see payroll information</p>
          </div>
        )}
      </div>

      {/* Payroll Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4">Payroll Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
            <span className="mr-2">📊</span>
            Generate Payroll Report
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
            <span className="mr-2">📧</span>
            Send Payroll Notifications
          </button>
          <button className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
            <span className="mr-2">💾</span>
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}


