import React, { useState, useEffect } from 'react';
import { getPayrollHistory, approvePayroll, markPayrollAsPaid } from '../lib/api';

const PayrollList = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const employeeId = '123'; // Replace with actual employee ID from context/auth

    useEffect(() => {
        loadPayrollHistory();
    }, [year]);

    const loadPayrollHistory = async () => {
        try {
            const data = await getPayrollHistory(employeeId, year);
            setPayrolls(data);
        } catch (err) {
            setError('Failed to load payroll history');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (payrollId) => {
        try {
            await approvePayroll(payrollId);
            await loadPayrollHistory();
        } catch (err) {
            setError('Failed to approve payroll');
        }
    };

    const handleMarkPaid = async (payrollId) => {
        try {
            await markPayrollAsPaid(payrollId);
            await loadPayrollHistory();
        } catch (err) {
            setError('Failed to mark payroll as paid');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Payroll History</h2>
                <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="border rounded px-3 py-2"
                >
                    {[...Array(5)].map((_, i) => {
                        const yearOption = new Date().getFullYear() - i;
                        return (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        );
                    })}
                </select>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Month
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Base Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                OT Pay
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deductions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payrolls.map((payroll) => (
                            <tr key={payroll._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(payroll.month).toLocaleDateString('default', { 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ${payroll.base_salary.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ${payroll.ot_pay.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ${(payroll.leave_deductions + payroll.late_penalties).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                    ${payroll.net_salary.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${payroll.status === 'paid' ? 'bg-green-100 text-green-800' :
                                          payroll.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'}`}
                                    >
                                        {payroll.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {payroll.status === 'draft' && (
                                        <button
                                            onClick={() => handleApprove(payroll._id)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {payroll.status === 'approved' && (
                                        <button
                                            onClick={() => handleMarkPaid(payroll._id)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollList;
