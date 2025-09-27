import React, { useState } from 'react';
import { applyLeave } from '../lib/api';

const LeaveForm = () => {
    const [formData, setFormData] = useState({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const employeeId = '123'; // Replace with actual employee ID from context/auth

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await applyLeave({
                ...formData,
                employee_id: employeeId
            });
            setSuccess(true);
            setFormData({
                leave_type: 'annual',
                start_date: '',
                end_date: '',
                reason: ''
            });
        } catch (err) {
            setError('Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Apply for Leave</h2>

            {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
                    Leave request submitted successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        Leave Type
                    </label>
                    <select
                        name="leave_type"
                        value={formData.leave_type}
                        onChange={handleChange}
                        className="bg-slate-700 border border-slate-600 text-slate-200 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="casual">Casual Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="bg-slate-700 border border-slate-600 text-slate-200 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="bg-slate-700 border border-slate-600 text-slate-200 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        Reason
                    </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="bg-slate-700 border border-slate-600 text-slate-200 rounded w-full py-2 px-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
            </form>
        </div>
    );
};

export default LeaveForm;
